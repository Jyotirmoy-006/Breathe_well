/**
 * @file model.ts
 * @description Pure engine combining exposure reductions and carbon offsets without double-counting.
 */

import type { ActionCatalogEntry, ActionConfidence } from '../catalog/types';
import { createKgCo2e } from '../types';
import type { Percentage } from '../types';

import { MAX_PHYSICAL_EXPOSURE_REDUCTION_PCT, WEEKS_PER_YEAR } from './constants';
import type { CombinedImpact } from './types';

function computeCombinedReduction(
  actions: readonly ActionCatalogEntry[],
  bound: 'low' | 'high',
): Percentage {
  let product = 1.0;
  for (const action of actions) {
    const pct = action.coefficients.pm25ExposureReductionPct[bound];
    const fraction = Math.max(0, Math.min(100, pct)) / 100;
    product *= 1.0 - fraction;
  }
  const rawPct = (1.0 - product) * 100;
  const cappedPct = Math.min(MAX_PHYSICAL_EXPOSURE_REDUCTION_PCT, Math.round(rawPct * 10) / 10);
  return cappedPct as Percentage;
}

function computeAdditiveCo2e(
  actions: readonly ActionCatalogEntry[],
  bound: 'low' | 'high',
): number {
  let total = 0;
  for (const action of actions) {
    total += action.coefficients.co2eKgPerWeek[bound];
  }
  return Math.round(total * 10) / 10;
}

function resolveOverallConfidence(actions: readonly ActionCatalogEntry[]): ActionConfidence {
  if (actions.length === 0) {
    return 'high';
  }
  if (actions.some((a) => a.coefficients.confidence === 'assumption')) {
    return 'assumption';
  }
  if (actions.some((a) => a.coefficients.confidence === 'medium')) {
    return 'medium';
  }
  return 'high';
}

/**
 * Combines catalog coefficients across multiple actions into a unified impact assessment.
 *
 * @param actions - Interventions selected for implementation.
 * @returns Combined impact with multiplicative exposure reduction and additive carbon savings.
 */
export function combineActionImpacts(actions: readonly ActionCatalogEntry[]): CombinedImpact {
  const lowRed = computeCombinedReduction(actions, 'low');
  const highRed = computeCombinedReduction(actions, 'high');

  const lowCo2eWeek = computeAdditiveCo2e(actions, 'low');
  const highCo2eWeek = computeAdditiveCo2e(actions, 'high');

  const lowCo2eYear = Math.round(lowCo2eWeek * WEEKS_PER_YEAR * 10) / 10;
  const highCo2eYear = Math.round(highCo2eWeek * WEEKS_PER_YEAR * 10) / 10;

  const confidence = resolveOverallConfidence(actions);
  const basis =
    'Multiplicative exposure model: R = 1 - Π(1 - r_i) capped at 85% physical ceiling. ' +
    'Additive carbon accounting across independent fuel and transport substitutions.';

  return {
    exposureReductionPct: { low: lowRed, high: highRed },
    co2eKgPerWeek: { low: createKgCo2e(lowCo2eWeek), high: createKgCo2e(highCo2eWeek) },
    co2eKgPerYear: { low: createKgCo2e(lowCo2eYear), high: createKgCo2e(highCo2eYear) },
    confidence,
    basis,
    actionCount: actions.length,
  };
}
