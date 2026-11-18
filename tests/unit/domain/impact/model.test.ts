/**
 * @file model.test.ts
 * @description Unit tests for non-double-counting multiplicative impact engine and carbon aggregation.
 */

import { describe, expect, it } from 'vitest';

import type { ActionCatalogEntry } from '@/domain/catalog';
import { MAX_PHYSICAL_EXPOSURE_REDUCTION_PCT, combineActionImpacts } from '@/domain/impact';

function createMockAction(
  id: string,
  lowRed: number,
  highRed: number,
  lowCo2e: number,
  highCo2e: number,
  confidence: 'high' | 'medium' | 'assumption' = 'high',
): ActionCatalogEntry {
  return {
    id,
    title: `Mock Action ${id}`,
    description: 'Mock action description for test',
    category: 'routine',
    effort: 1,
    cost: 'free',
    timeBlock: 'morning',
    eligibilityRules: {},
    coefficients: {
      pm25ExposureReductionPct: { low: lowRed, high: highRed },
      co2eKgPerWeek: { low: lowCo2e, high: highCo2e },
      basis: 'Mock test basis',
      confidence,
    },
    evidenceNotes: 'Mock evidence citation',
  };
}

describe('Impact Model', () => {
  it('combines independent exposure reductions multiplicatively', () => {
    // Two 50% reductions: 1 - (1 - 0.5) * (1 - 0.5) = 0.75 (75%)
    const a1 = createMockAction('a1', 50, 50, 0, 0);
    const a2 = createMockAction('a2', 50, 50, 0, 0);

    const result = combineActionImpacts([a1, a2]);
    expect(result.exposureReductionPct.low).toBe(75);
    expect(result.exposureReductionPct.high).toBe(75);
    expect(result.actionCount).toBe(2);
  });

  it('caps combined reduction at the 85% physical ceiling', () => {
    // Three 80% reductions would theoretically reach 99.2%, but real buildings cap at 85%
    const a1 = createMockAction('a1', 80, 80, 0, 0);
    const a2 = createMockAction('a2', 80, 80, 0, 0);
    const a3 = createMockAction('a3', 80, 80, 0, 0);

    const result = combineActionImpacts([a1, a2, a3]);
    expect(result.exposureReductionPct.low).toBe(MAX_PHYSICAL_EXPOSURE_REDUCTION_PCT);
    expect(result.exposureReductionPct.high).toBe(MAX_PHYSICAL_EXPOSURE_REDUCTION_PCT);
  });

  it('aggregates greenhouse gas reductions additively with weekly and annual figures', () => {
    const a1 = createMockAction('a1', 10, 20, 5, 10);
    const a2 = createMockAction('a2', 15, 25, 3, 7);

    const result = combineActionImpacts([a1, a2]);
    expect(result.co2eKgPerWeek.low).toBe(8);
    expect(result.co2eKgPerWeek.high).toBe(17);
    expect(result.co2eKgPerYear.low).toBe(8 * 52);
    expect(result.co2eKgPerYear.high).toBe(17 * 52);
  });

  it('resolves confidence hierarchy correctly (assumption > medium > high)', () => {
    const highAct = createMockAction('h', 10, 20, 0, 0, 'high');
    const medAct = createMockAction('m', 10, 20, 0, 0, 'medium');
    const assumpAct = createMockAction('a', 10, 20, 0, 0, 'assumption');

    expect(combineActionImpacts([highAct]).confidence).toBe('high');
    expect(combineActionImpacts([highAct, medAct]).confidence).toBe('medium');
    expect(combineActionImpacts([highAct, medAct, assumpAct]).confidence).toBe('assumption');
  });

  it('handles empty action sets gracefully', () => {
    const result = combineActionImpacts([]);
    expect(result.actionCount).toBe(0);
    expect(result.exposureReductionPct.low).toBe(0);
    expect(result.co2eKgPerWeek.low).toBe(0);
    expect(result.confidence).toBe('high');
    expect(result.basis).toContain('85%');
  });
});
