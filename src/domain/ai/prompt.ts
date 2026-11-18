/**
 * @file prompt.ts
 * @description Secure prompt generator with delimiter isolation and strict guardrails.
 */

import type { AqiCategory } from '../aqi/constants';
import type { UserProfile } from '../profile/types';

/** Parameters needed to compose the prompt for the generative AI assistant. */
export interface PlanAiPromptInput {
  readonly profile: UserProfile;
  readonly aqiCategory: AqiCategory;
  readonly aqiVerdict: string;
  readonly selectedActionIds: readonly string[];
}

function sanitizeText(text: string): string {
  return text.replace(/<<<|>>>/g, '');
}

function formatProfileJson(profile: UserProfile): string {
  const sanitized = {
    householdSize: profile.householdSize,
    children: profile.children,
    elderly: profile.elderly,
    sensitiveGroup: profile.sensitiveGroup,
    homeType: sanitizeText(profile.homeType),
    commuteMode: sanitizeText(profile.commuteMode),
    cookingFuel: sanitizeText(profile.cookingFuel),
    heatingMethod: sanitizeText(profile.heatingMethod),
    hasAirPurifier: profile.hasAirPurifier,
    budget: sanitizeText(profile.budget),
  };
  return JSON.stringify(sanitized);
}

/**
 * Builds an injection-safe, delimiter-protected prompt for LLM plan enhancement.
 *
 * @param input - Contextual air quality data and selected actions.
 * @returns Fully formatted system and data prompt string.
 */
export function buildPlanAiPrompt(input: PlanAiPromptInput): string {
  const safeCategory = sanitizeText(input.aqiCategory);
  const safeVerdict = sanitizeText(input.aqiVerdict);
  const safeProfile = formatProfileJson(input.profile);
  const safeActions = input.selectedActionIds.map(sanitizeText).join(', ');

  return [
    'You are the AI lifestyle companion for SaafSaans.',
    '<<<INSTRUCTIONS>>>',
    'STRICT GUARDRAILS:',
    '1. ZERO NUMBERS: Do not cite any numerical quantities, percentages, or concentrations.',
    '2. ZERO MEDICAL ADVICE: Do not prescribe medication, diagnose illness, or advise clinical therapies.',
    '3. BE CONCISE: 1-2 sentences per rationale. Keep dayNarrative to 2-3 sentences.',
    '4. EXACT JSON SCHEMA: Return JSON matching this exact structure:',
    '{"dayNarrative":"<2-3 sentences overview>","actionRationales":[{"actionId":"<id>","personalRationale":"<1-2 sentences>"}],"communityTalkingPoints":["<point 1>"],"aiSuggestions":[{"title":"<title>","explanation":"<advice>","flaggedAsUnquantified":true}]}',
    '<<<END_INSTRUCTIONS>>>',
    '<<<DATA>>>',
    `AIR QUALITY TIER: ${safeCategory}`,
    `STATUS VERDICT: ${safeVerdict}`,
    `USER PROFILE: ${safeProfile}`,
    `SELECTED ACTIONS: [${safeActions}]`,
    '<<<END_DATA>>>',
  ].join('\n');
}
