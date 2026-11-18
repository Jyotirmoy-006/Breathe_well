/**
 * @file journalBaseline.ts
 * @description Baseline data for immediate server-side and initial client rendering.
 */

import { analyzeTimelineWindows } from '../../domain/planner/bestWindow';
import type { TimelineWindows } from '../../domain/planner/types';
import { createPm25UgM3 } from '../../domain/types';
import type { LiveAirMetrics } from '../hero/types';
import type { TimelineHour } from '../timeline/types';

export const BASELINE_LIVE_METRICS: LiveAirMetrics = {
  currentPm25: 285,
  currentPm10: 410,
  currentNo2: 68,
  aqi: 395,
  cpcbCategory: 'Very Poor',
  whoMultiple: 19.0,
  recordedAtIso: new Date().toISOString(),
};

/** Generates deterministic 48-hour diurnal cycle for immediate render */
export function generateBaselineHourly(): readonly TimelineHour[] {
  const points: TimelineHour[] = [];
  const now = new Date();
  now.setMinutes(0, 0, 0);

  for (let i = 0; i < 48; i++) {
    const d = new Date(now.getTime() + i * 3600 * 1000);
    const hour = d.getHours();
    // Diurnal winter smog profile: elevated late night & morning (06-09), lower midday (13-16)
    const factor = hour >= 6 && hour <= 9 ? 1.25 : hour >= 13 && hour <= 16 ? 0.65 : 1.0;
    const pm25 = Math.round(240 * factor + (i % 5) * 8);
    const subIndex = Math.min(500, Math.round(pm25 * 1.35));

    points.push({
      hourIso: d.toISOString(),
      pm25,
      pm10: Math.round(pm25 * 1.45),
      no2: 55,
      cpcbSubIndex: subIndex,
      cpcbCategory: subIndex > 400 ? 'Severe' : 'Very Poor',
      whoMultiple: Math.round((pm25 / 15) * 10) / 10,
    });
  }
  return points;
}

export function computeBaselineWindows(hourly: readonly TimelineHour[]): TimelineWindows {
  const points = hourly.map((h) => ({
    hourIso: h.hourIso,
    pm25: createPm25UgM3(h.pm25),
  }));
  return analyzeTimelineWindows(points);
}
