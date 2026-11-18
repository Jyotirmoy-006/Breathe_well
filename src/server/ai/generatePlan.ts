/**
 * @file generatePlan.ts
 * @description Orchestrates action plan generation with deterministic fallback and AI personalization.
 * Injects medical advisories and merges Gemini rationales into catalog recommendations.
 */

import { requestGeminiPersonalization } from './geminiClient';

import { buildPlanAiPrompt } from '@/domain/ai/prompt';
import type { StructuredAiResponse } from '@/domain/ai/schema';
import { getAqiCategoryVerdict } from '@/domain/aqi';
import { generatePlan as buildDeterministicPlan } from '@/domain/planner/engine';
import type { ActionPlan, PlanActionItem } from '@/domain/planner/types';
import type { UserProfile } from '@/domain/profile/types';
import type { Pm25UgM3 } from '@/domain/types';
import { detectPromptInjection } from '@/server/security/sanitize';

/** Critical medical alert for Severe and Very Poor air quality categories. */
export const SEVERE_MEDICAL_ADVISORY =
  'CRITICAL MEDICAL ADVISORY: Air quality is in the Severe / Very Poor tier. High-risk groups (children, elderly, pregnant women, and patients with asthma, COPD, or cardiac conditions) should stay indoors, use HEPA filtration, and seek prompt clinical care if experiencing shortness of breath.' as const;

/** Extended plan payload including optional medical advisories and AI narrative. */
export interface OrchestratedPlan extends ActionPlan {
  readonly medicalAdvisory?: string | undefined;
  readonly aiNarrative?: string | undefined;
  readonly communityTalkingPoints?: readonly string[] | undefined;
  readonly aiSuggestions?: readonly StructuredAiResponse['aiSuggestions'][number][] | undefined;
}

/** Execution metadata indicating whether personalization succeeded. */
export interface PlanMetadata {
  readonly mode: 'ai' | 'rule-based';
  readonly reason?: string | undefined;
}

/** Complete response from the plan orchestration engine. */
export interface OrchestratedPlanResult {
  readonly plan: OrchestratedPlan;
  readonly meta: PlanMetadata;
}

function updateItems(
  items: readonly PlanActionItem[],
  lookup: Map<string, string>,
): readonly PlanActionItem[] {
  return items.map((item) => {
    const aiRationale = lookup.get(item.action.id);
    return aiRationale ? { ...item, rationale: aiRationale } : item;
  });
}

function applyAiEnhancements(
  plan: ActionPlan,
  ai: StructuredAiResponse,
  advisory?: string,
): OrchestratedPlan {
  const lookup = new Map(ai.actionRationales.map((r) => [r.actionId, r.personalRationale]));

  return {
    ...plan,
    routine: {
      timeBlocks: plan.routine.timeBlocks.map((block) => ({
        timeBlock: block.timeBlock,
        actions: updateItems(block.actions, lookup),
      })),
      totalActions: plan.routine.totalActions,
    },
    homeAir: { actions: updateItems(plan.homeAir.actions, lookup) },
    swaps: { actions: updateItems(plan.swaps.actions, lookup) },
    community: { actions: updateItems(plan.community.actions, lookup) },
    medicalAdvisory: advisory,
    aiNarrative: ai.dayNarrative,
    communityTalkingPoints: ai.communityTalkingPoints,
    aiSuggestions: ai.aiSuggestions,
  };
}

function collectAllActionIds(plan: ActionPlan): readonly string[] {
  const routineIds = plan.routine.timeBlocks.flatMap((b) => b.actions.map((a) => a.action.id));
  const homeIds = plan.homeAir.actions.map((a) => a.action.id);
  const swapIds = plan.swaps.actions.map((a) => a.action.id);
  const communityIds = plan.community.actions.map((a) => a.action.id);
  return [...routineIds, ...homeIds, ...swapIds, ...communityIds];
}

function resolveAdvisory(category: string): string | undefined {
  if (category === 'Severe' || category === 'Very Poor') {
    return SEVERE_MEDICAL_ADVISORY;
  }
  return undefined;
}

/**
 * Orchestrates lifestyle plan generation, blending deterministic models with generative personalization.
 *
 * @param profile - Validated user profile.
 * @param currentPm25 - Real-time or forecasted PM2.5 in µg/m³.
 * @returns Combined plan result with execution metadata.
 */
export async function orchestratePlan(
  profile: UserProfile,
  currentPm25: Pm25UgM3,
): Promise<OrchestratedPlanResult> {
  const basePlan = buildDeterministicPlan(profile, currentPm25);
  const advisory = resolveAdvisory(basePlan.aqiCategory);

  if (detectPromptInjection(JSON.stringify(profile))) {
    return {
      plan: { ...basePlan, medicalAdvisory: advisory },
      meta: { mode: 'rule-based', reason: 'HOSTILE_INPUT_DETECTED' },
    };
  }

  const promptInput = {
    profile,
    aqiCategory: basePlan.aqiCategory,
    aqiVerdict: getAqiCategoryVerdict(basePlan.aqiCategory),
    selectedActionIds: collectAllActionIds(basePlan),
  };

  const prompt = buildPlanAiPrompt(promptInput);
  const aiResult = await requestGeminiPersonalization(prompt);

  if (!aiResult.ok) {
    return {
      plan: { ...basePlan, medicalAdvisory: advisory },
      meta: { mode: 'rule-based', reason: aiResult.error },
    };
  }

  return {
    plan: applyAiEnhancements(basePlan, aiResult.value, advisory),
    meta: { mode: 'ai' },
  };
}
