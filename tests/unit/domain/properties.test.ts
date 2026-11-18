/**
 * @file properties.test.ts
 * @description Property-based tests using fast-check verifying core domain mathematical invariants.
 */

import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { computeCpcbCategory } from '../../../src/domain/aqi/category';
import { computeCpcbSubIndex } from '../../../src/domain/aqi/subindex';
import { ACTION_CATALOG } from '../../../src/domain/catalog/actions';
import type { ActionCatalogEntry } from '../../../src/domain/catalog/types';
import { combineActionImpacts } from '../../../src/domain/impact/model';
import { analyzeTimelineWindows } from '../../../src/domain/planner/bestWindow';
import type { TimelineForecastPoint } from '../../../src/domain/planner/bestWindow';
import { generatePlan } from '../../../src/domain/planner/engine';
import type { UserProfile } from '../../../src/domain/profile/types';
import { createPm25UgM3 } from '../../../src/domain/types';

const CATEGORY_ORDER: Record<string, number> = {
  Good: 1,
  Satisfactory: 2,
  Moderate: 3,
  Poor: 4,
  'Very Poor': 5,
  Severe: 6,
};

describe('Property-Based Domain Invariants (fast-check)', () => {
  it('AQI category is monotonic in PM2.5 concentration', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1000, noNaN: true }),
        fc.float({ min: 0, max: 1000, noNaN: true }),
        (pmA, pmB) => {
          const lower = Math.min(pmA, pmB);
          const higher = Math.max(pmA, pmB);

          const catLower = computeCpcbCategory(createPm25UgM3(lower));
          const catHigher = computeCpcbCategory(createPm25UgM3(higher));

          const rankLower = CATEGORY_ORDER[catLower] ?? 0;
          const rankHigher = CATEGORY_ORDER[catHigher] ?? 0;

          expect(rankHigher).toBeGreaterThanOrEqual(rankLower);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('sub-index is always bounded within [0, 500]', () => {
    fc.assert(
      fc.property(fc.float({ min: -50, max: 2000, noNaN: true }), (pm25) => {
        const subIndex = computeCpcbSubIndex(createPm25UgM3(pm25));
        expect(subIndex).toBeGreaterThanOrEqual(0);
        expect(subIndex).toBeLessThanOrEqual(500);
      }),
      { numRuns: 200 },
    );
  });

  it('impact model never exceeds 100% reduction and never goes negative', () => {
    fc.assert(
      fc.property(
        fc.subarray(ACTION_CATALOG as ActionCatalogEntry[], { minLength: 0, maxLength: 30 }),
        (selectedActions) => {
          const impact = combineActionImpacts(selectedActions);
          expect(impact.exposureReductionPct.low).toBeGreaterThanOrEqual(0);
          expect(impact.exposureReductionPct.low).toBeLessThanOrEqual(100);
          expect(impact.exposureReductionPct.high).toBeGreaterThanOrEqual(0);
          expect(impact.exposureReductionPct.high).toBeLessThanOrEqual(100);
          expect(impact.exposureReductionPct.high).toBeGreaterThanOrEqual(
            impact.exposureReductionPct.low,
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it('combining actions is order-independent (commutative)', () => {
    fc.assert(
      fc.property(
        fc.subarray(ACTION_CATALOG as ActionCatalogEntry[], { minLength: 2, maxLength: 8 }),
        (selectedActions) => {
          const forward = combineActionImpacts(selectedActions);
          const reversed = combineActionImpacts([...selectedActions].reverse());

          expect(forward.exposureReductionPct.low).toEqual(reversed.exposureReductionPct.low);
          expect(forward.exposureReductionPct.high).toEqual(reversed.exposureReductionPct.high);
          expect(forward.co2eKgPerWeek.high).toEqual(reversed.co2eKgPerWeek.high);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('planner never returns ineligible actions for any valid profile and PM2.5 tier', () => {
    const profileArbitrary: fc.Arbitrary<UserProfile> = fc.record({
      householdSize: fc.integer({ min: 1, max: 10 }),
      commuteMode: fc.constantFrom('metro_bus', 'walk_cycle', 'two_wheeler', 'car_ac', 'wfh'),
      cookingFuel: fc.constantFrom('lpg_induction', 'biomass_coal', 'electric'),
      heatingMethod: fc.constantFrom('electric_heater', 'wood_angithi', 'none'),
      hasAirPurifier: fc.boolean(),
      children: fc.boolean(),
      elderly: fc.boolean(),
      sensitiveGroup: fc.boolean(),
      budget: fc.constantFrom('free', 'low', 'flexible'),
      homeType: fc.constantFrom('apartment', 'independent', 'hostel'),
    });

    fc.assert(
      fc.property(
        profileArbitrary,
        fc.float({ min: 5, max: 600, noNaN: true }),
        (profile, pm25) => {
          const plan = generatePlan(profile, createPm25UgM3(pm25));
          const allActions = [
            ...plan.homeAir.actions.map((i) => i.action),
            ...plan.swaps.actions.map((i) => i.action),
            ...plan.community.actions.map((i) => i.action),
            ...plan.routine.timeBlocks.flatMap((b) => b.actions.map((i) => i.action)),
          ];

          for (const item of allActions) {
            // Budget check
            if (profile.budget === 'free') {
              expect(item.cost).toBe('free');
            } else if (profile.budget === 'low') {
              expect(['free', 'low']).toContain(item.cost);
            }

            // Purifier check
            if (item.eligibilityRules.hasPurifier !== undefined) {
              expect(item.eligibilityRules.hasPurifier).toBe(profile.hasAirPurifier);
            }

            // Transit check
            if (item.eligibilityRules.needsCar) {
              expect(profile.commuteMode).toBe('car_ac');
            }
            if (item.eligibilityRules.needsTwoWheeler) {
              expect(profile.commuteMode).toBe('two_wheeler');
            }

            // Heating check
            if (item.eligibilityRules.needsHeating) {
              expect(profile.heatingMethod).not.toBe('none');
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('best-window is always inside the forecast timeline range', () => {
    const timelineArbitrary: fc.Arbitrary<readonly TimelineForecastPoint[]> = fc
      .array(
        fc.record({
          hourIso: fc
            .date({ min: new Date('2025-01-01'), max: new Date('2027-01-01'), noInvalidDate: true })
            .map((d) => d.toISOString()),
          pm25: fc.float({ min: 10, max: 500, noNaN: true }).map((v) => createPm25UgM3(v)),
        }),
        { minLength: 3, maxLength: 48 },
      )
      .map((arr) => arr as readonly TimelineForecastPoint[]);

    fc.assert(
      fc.property(timelineArbitrary, (timeline) => {
        const windows = analyzeTimelineWindows(timeline, 3);

        expect(windows.bestWindow.startIndex).toBeGreaterThanOrEqual(0);
        expect(windows.bestWindow.startIndex).toBeLessThan(timeline.length);
        expect(windows.bestWindow.endIndex).toBeGreaterThanOrEqual(windows.bestWindow.startIndex);
        expect(windows.bestWindow.endIndex).toBeLessThan(timeline.length);

        expect(windows.avoidWindow.startIndex).toBeGreaterThanOrEqual(0);
        expect(windows.avoidWindow.startIndex).toBeLessThan(timeline.length);
        expect(windows.avoidWindow.endIndex).toBeGreaterThanOrEqual(windows.avoidWindow.startIndex);
        expect(windows.avoidWindow.endIndex).toBeLessThan(timeline.length);
      }),
      { numRuns: 100 },
    );
  });
});
