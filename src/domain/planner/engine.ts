/**
 * @file engine.ts
 * @description Pure deterministic action plan generator filtering actions by profile and live AQI.
 */

import { computeCpcbCategory } from '../aqi/category';
import type { AqiCategory } from '../aqi/constants';
import { ACTION_CATALOG } from '../catalog/actions';
import type {
  ActionCatalogEntry,
  ActionCost,
  ActionEligibilityRules,
  ActionTimeBlock,
} from '../catalog/types';
import { combineActionImpacts } from '../impact/model';
import type { BudgetTier, CommuteMode, HeatingMethod, UserProfile } from '../profile/types';
import type { Pm25UgM3 } from '../types';

import type { ActionPlan, PlanActionItem, TimeBlockGroup } from './types';

const TIME_BLOCKS: readonly ActionTimeBlock[] = [
  'morning',
  'commute',
  'midday',
  'evening',
  'night',
  'all_day',
];

function checkBudget(actionCost: ActionCost, userBudget: BudgetTier): boolean {
  if (userBudget === 'flexible') {
    return true;
  }
  if (userBudget === 'low') {
    return actionCost === 'free' || actionCost === 'low';
  }
  return actionCost === 'free';
}

function checkTransitEligibility(rules: ActionEligibilityRules, commuteMode: CommuteMode): boolean {
  if (rules.needsCar && commuteMode !== 'car_ac') {
    return false;
  }
  if (rules.needsTwoWheeler && commuteMode !== 'two_wheeler') {
    return false;
  }
  return true;
}

function checkDwellingEligibility(
  rules: ActionEligibilityRules,
  heatingMethod: HeatingMethod,
  hasPurifier: boolean,
): boolean {
  if (rules.needsHeating && heatingMethod === 'none') {
    return false;
  }
  if (rules.hasPurifier !== undefined && rules.hasPurifier !== hasPurifier) {
    return false;
  }
  return true;
}

function checkAqiEligibility(rules: ActionEligibilityRules, category: AqiCategory): boolean {
  if (rules.minAqiCategory && !rules.minAqiCategory.includes(category)) {
    return false;
  }
  return true;
}

function isActionEligible(
  action: ActionCatalogEntry,
  profile: UserProfile,
  category: AqiCategory,
): boolean {
  const rules = action.eligibilityRules;
  if (!checkTransitEligibility(rules, profile.commuteMode)) {
    return false;
  }
  if (!checkDwellingEligibility(rules, profile.heatingMethod, profile.hasAirPurifier)) {
    return false;
  }
  if (!checkAqiEligibility(rules, category)) {
    return false;
  }
  return checkBudget(action.cost, profile.budget);
}

function generateVulnerableRationale(
  action: ActionCatalogEntry,
  profile: UserProfile,
): string | undefined {
  if (profile.children && action.category === 'community') {
    return 'Protects school-going children in the society during high pollution.';
  }
  if (profile.elderly && action.category === 'home') {
    return 'Safeguards vulnerable senior family members in indoor living areas.';
  }
  if (profile.commuteMode === 'two_wheeler' && action.timeBlock === 'commute') {
    return 'Crucial protective barrier against direct roadway vehicular exhaust.';
  }
  return undefined;
}

function generateRationale(
  action: ActionCatalogEntry,
  profile: UserProfile,
  category: AqiCategory,
): string {
  const vulnerable = generateVulnerableRationale(action, profile);
  if (vulnerable) {
    return vulnerable;
  }
  if (category === 'Severe' || category === 'Very Poor') {
    return `Priority measure for ${category} air quality: ${action.coefficients.basis}.`;
  }
  return `Targeted mitigation: ${action.coefficients.basis}.`;
}

function groupRoutineActions(items: readonly PlanActionItem[]): readonly TimeBlockGroup[] {
  return TIME_BLOCKS.map((timeBlock) => ({
    timeBlock,
    actions: items.filter((item) => item.action.timeBlock === timeBlock),
  })).filter((group) => group.actions.length > 0);
}

/**
 * Deterministically compiles a customized four-category action plan based on user profile and AQI.
 *
 * @param profile - User demographic and dwelling profile.
 * @param currentPm25 - Real-time or forecasted PM2.5 concentration in µg/m³.
 * @param catalog - Optional custom catalog override (defaults to ACTION_CATALOG).
 * @returns Fully populated ActionPlan.
 */
export function generatePlan(
  profile: UserProfile,
  currentPm25: Pm25UgM3,
  catalog: readonly ActionCatalogEntry[] = ACTION_CATALOG,
): ActionPlan {
  const aqiCategory = computeCpcbCategory(currentPm25);
  const eligible = catalog.filter((action) => isActionEligible(action, profile, aqiCategory));

  const items: PlanActionItem[] = eligible.map((action, index) => ({
    action,
    rationale: generateRationale(action, profile, aqiCategory),
    priority: index + 1,
  }));

  const routineItems = items.filter((item) => item.action.category === 'routine');
  const homeItems = items.filter((item) => item.action.category === 'home');
  const swapItems = items.filter((item) => item.action.category === 'swap');
  const communityItems = items.filter((item) => item.action.category === 'community');

  const impact = combineActionImpacts(eligible);

  return {
    aqiCategory,
    currentPm25,
    routine: {
      timeBlocks: groupRoutineActions(routineItems),
      totalActions: routineItems.length,
    },
    homeAir: { actions: homeItems },
    swaps: { actions: swapItems },
    community: { actions: communityItems },
    impact,
    totalActionCount: items.length,
    generatedAtIso: new Date().toISOString(),
  };
}
