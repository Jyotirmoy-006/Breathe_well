/**
 * @file engine.test.ts
 * @description Unit tests for the deterministic planner engine, eligibility filtering, and time-blocking.
 */

import { describe, expect, it } from 'vitest';

import { createPm25UgM3 } from '@/domain/aqi';
import { generatePlan } from '@/domain/planner';
import type { UserProfile } from '@/domain/profile';

describe('Planner Engine', () => {
  const baseProfile: UserProfile = {
    householdSize: 4,
    children: true,
    elderly: false,
    sensitiveGroup: true,
    homeType: 'apartment',
    commuteMode: 'car_ac',
    cookingFuel: 'lpg_induction',
    heatingMethod: 'electric_heater',
    hasAirPurifier: false,
    budget: 'flexible',
  };

  it('generates a full 4-tab plan deterministically with zero AI', () => {
    const plan1 = generatePlan(baseProfile, createPm25UgM3(150));
    const plan2 = generatePlan(baseProfile, createPm25UgM3(150));

    expect(plan1.totalActionCount).toBe(plan2.totalActionCount);
    expect(plan1.aqiCategory).toBe('Very Poor');
    expect(plan1.routine.timeBlocks.length).toBeGreaterThan(0);
    expect(plan1.homeAir.actions.length).toBeGreaterThan(0);
    expect(plan1.swaps.actions.length).toBeGreaterThan(0);
    expect(plan1.community.actions.length).toBeGreaterThan(0);
    expect(plan1.impact.exposureReductionPct.high).toBeGreaterThan(0);
  });

  it('filters out car-specific actions for non-car commuters', () => {
    const carPlan = generatePlan(baseProfile, createPm25UgM3(150));
    const bikePlan = generatePlan(
      { ...baseProfile, commuteMode: 'two_wheeler' },
      createPm25UgM3(150),
    );

    const carHasRecirc = carPlan.routine.timeBlocks.some((tb) =>
      tb.actions.some((a) => a.action.id === 'routine-car-recirc'),
    );
    const bikeHasRecirc = bikePlan.routine.timeBlocks.some((tb) =>
      tb.actions.some((a) => a.action.id === 'routine-car-recirc'),
    );

    expect(carHasRecirc).toBe(true);
    expect(bikeHasRecirc).toBe(false);
  });

  it('filters out purifier boost action when user does not own an air purifier', () => {
    const withoutPurifier = generatePlan(baseProfile, createPm25UgM3(150));
    const withPurifier = generatePlan(
      { ...baseProfile, hasAirPurifier: true },
      createPm25UgM3(150),
    );

    const withoutHasBoost = withoutPurifier.homeAir.actions.some(
      (a) => a.action.id === 'home-purifier-high-peak',
    );
    const withHasBoost = withPurifier.homeAir.actions.some(
      (a) => a.action.id === 'home-purifier-high-peak',
    );

    expect(withoutHasBoost).toBe(false);
    expect(withHasBoost).toBe(true);
  });

  it('enforces strict budget tiers (free, low, flexible)', () => {
    const freePlan = generatePlan({ ...baseProfile, budget: 'free' }, createPm25UgM3(150));
    const lowPlan = generatePlan({ ...baseProfile, budget: 'low' }, createPm25UgM3(150));
    const flexiblePlan = generatePlan({ ...baseProfile, budget: 'flexible' }, createPm25UgM3(150));

    // Free plan must have only 'free' actions
    for (const item of [
      ...freePlan.routine.timeBlocks.flatMap((b) => b.actions),
      ...freePlan.homeAir.actions,
      ...freePlan.swaps.actions,
      ...freePlan.community.actions,
    ]) {
      expect(item.action.cost).toBe('free');
    }

    // Low plan should include free and low, but exclude medium/high
    for (const item of [
      ...lowPlan.routine.timeBlocks.flatMap((b) => b.actions),
      ...lowPlan.homeAir.actions,
      ...lowPlan.swaps.actions,
      ...lowPlan.community.actions,
    ]) {
      expect(item.action.cost === 'free' || item.action.cost === 'low').toBe(true);
    }

    expect(flexiblePlan.totalActionCount).toBeGreaterThan(lowPlan.totalActionCount);
    expect(lowPlan.totalActionCount).toBeGreaterThan(freePlan.totalActionCount);
  });

  it('filters out heating actions when heatingMethod is none', () => {
    const withHeating = generatePlan(
      { ...baseProfile, heatingMethod: 'wood_angithi' },
      createPm25UgM3(150),
    );
    const withoutHeating = generatePlan(
      { ...baseProfile, heatingMethod: 'none' },
      createPm25UgM3(150),
    );

    const withHasHeaterSwap = withHeating.swaps.actions.some(
      (a) => a.action.id === 'swap-electric-heater-angithi',
    );
    const withoutHasHeaterSwap = withoutHeating.swaps.actions.some(
      (a) => a.action.id === 'swap-electric-heater-angithi',
    );

    expect(withHasHeaterSwap).toBe(true);
    expect(withoutHasHeaterSwap).toBe(false);
  });

  it('generates customized rationale for elderly and bike commuter personas', () => {
    const elderlyPlan = generatePlan(
      { ...baseProfile, children: false, elderly: true },
      createPm25UgM3(150),
    );
    const elderlyHomeItem = elderlyPlan.homeAir.actions[0];
    expect(elderlyHomeItem?.rationale).toContain('senior family members');

    const bikePlan = generatePlan(
      { ...baseProfile, commuteMode: 'two_wheeler' },
      createPm25UgM3(150),
    );
    const bikeCommuteItem = bikePlan.routine.timeBlocks
      .flatMap((tb) => tb.actions)
      .find((a) => a.action.timeBlock === 'commute');
    expect(bikeCommuteItem?.rationale).toContain('roadway vehicular exhaust');
  });

  it('respects minAqiCategory condition for Severe/Poor community actions', () => {
    const goodPlan = generatePlan(baseProfile, createPm25UgM3(20)); // Good
    const severePlan = generatePlan(baseProfile, createPm25UgM3(300)); // Severe

    const goodHasAssembly = goodPlan.community.actions.some(
      (a) => a.action.id === 'community-school-indoor-assembly',
    );
    const severeHasAssembly = severePlan.community.actions.some(
      (a) => a.action.id === 'community-school-indoor-assembly',
    );

    expect(goodHasAssembly).toBe(false);
    expect(severeHasAssembly).toBe(true);
  });
});
