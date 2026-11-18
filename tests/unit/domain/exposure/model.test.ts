/**
 * @file model.test.ts
 * @description Unit tests for microenvironmental inhaled PM2.5 exposure simulation.
 */

import { describe, expect, it } from 'vitest';

import { computeDailyExposure, createHourOfDay, createPercentage, createPm25UgM3 } from '@/domain';
import type { HourlyAmbientPoint } from '@/domain/exposure';
import type { Percentage } from '@/domain/types';

function asPct(val: number): Percentage | undefined {
  const res = createPercentage(val);
  return res.ok ? res.value : undefined;
}

function generate24hAmbient(pm25: number): HourlyAmbientPoint[] {
  return Array.from({ length: 24 }, (_, i) => {
    const hourRes = createHourOfDay(i);
    const hour = hourRes.ok
      ? hourRes.value
      : (0 as ReturnType<typeof createHourOfDay> extends { ok: true; value: infer V } ? V : never);
    return {
      hour,
      ambientPm25: createPm25UgM3(pm25),
    };
  });
}

describe('Exposure Model', () => {
  it('computes 24h baseline and mitigated exposure for standard commuter', () => {
    const ambient = generate24hAmbient(100);
    const result = computeDailyExposure({
      profile: { hasAirPurifier: false, commuteMode: 'car_ac' },
      hourlyAmbient: ambient,
      actionMitigationPct: asPct(20),
    });

    expect(result.baselineExposureUgM3Hours).toBeGreaterThan(0);
    expect(result.mitigatedExposureUgM3Hours).toBeLessThan(result.baselineExposureUgM3Hours);
    expect(result.reductionPercentage).toBe(20);
    expect(result.hourlyPoints).toHaveLength(24);
  });

  it('demonstrates substantial exposure reduction with home HEPA purifier', () => {
    const ambient = generate24hAmbient(100);
    const noPurifier = computeDailyExposure({
      profile: { hasAirPurifier: false, commuteMode: 'wfh' },
      hourlyAmbient: ambient,
    });
    const withPurifier = computeDailyExposure({
      profile: { hasAirPurifier: true, commuteMode: 'wfh' },
      hourlyAmbient: ambient,
    });

    // Infiltration factor is 0.5 without purifier vs 0.15 with purifier
    expect(withPurifier.baselineExposureUgM3Hours).toBeLessThan(
      noPurifier.baselineExposureUgM3Hours * 0.4,
    );
  });

  it('distinguishes between transit microenvironments', () => {
    const ambient = generate24hAmbient(200);
    const metro = computeDailyExposure({
      profile: { hasAirPurifier: false, commuteMode: 'metro_bus' },
      hourlyAmbient: ambient,
    });
    const openRoad = computeDailyExposure({
      profile: { hasAirPurifier: false, commuteMode: 'two_wheeler' },
      hourlyAmbient: ambient,
    });

    expect(metro.baselineExposureUgM3Hours).toBeLessThan(openRoad.baselineExposureUgM3Hours);
  });

  it('handles zero mitigation and 100% mitigation extremes', () => {
    const ambient = generate24hAmbient(150);
    const zero = computeDailyExposure({
      profile: { hasAirPurifier: false, commuteMode: 'wfh' },
      hourlyAmbient: ambient,
      actionMitigationPct: asPct(0),
    });
    expect(zero.reductionPercentage).toBe(0);
    expect(zero.mitigatedExposureUgM3Hours).toBe(zero.baselineExposureUgM3Hours);

    const full = computeDailyExposure({
      profile: { hasAirPurifier: false, commuteMode: 'wfh' },
      hourlyAmbient: ambient,
      actionMitigationPct: asPct(100),
    });
    expect(full.reductionPercentage).toBe(100);
    expect(full.mitigatedExposureUgM3Hours).toBe(0);
  });

  it('handles empty ambient list gracefully without division by zero', () => {
    const result = computeDailyExposure({
      profile: { hasAirPurifier: false, commuteMode: 'wfh' },
      hourlyAmbient: [],
    });
    expect(result.baselineExposureUgM3Hours).toBe(0);
    expect(result.hourlyPoints).toHaveLength(0);
  });
});
