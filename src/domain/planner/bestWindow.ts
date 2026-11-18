/**
 * @file bestWindow.ts
 * @description Analyzes hourly timeline forecast to identify optimal and high-hazard activity windows.
 */

import { createPm25UgM3 } from '../types';
import type { Pm25UgM3 } from '../types';

import type { TimelineWindow, TimelineWindows } from './types';

/** Hourly forecast datapoint along a timeline. */
export interface TimelineForecastPoint {
  readonly hourIso: string;
  readonly pm25: Pm25UgM3;
}

const DEFAULT_WINDOW_SIZE_HOURS = 3;

/**
 * Safely retrieves a timeline point by index, returning fallback if out of bounds.
 * @param timeline - List of hourly readings.
 * @param index - Array index.
 */
export function getTimelinePointAt(
  timeline: readonly TimelineForecastPoint[],
  index: number,
): TimelineForecastPoint {
  const pt = timeline[index];
  if (!pt) {
    return { hourIso: 'N/A', pm25: createPm25UgM3(0) };
  }
  return pt;
}

function computeWindowAverage(
  timeline: readonly TimelineForecastPoint[],
  start: number,
  length: number,
): number {
  let sum = 0;
  for (let i = start; i < start + length; i++) {
    sum += getTimelinePointAt(timeline, i).pm25;
  }
  return sum / length;
}

function buildFallbackWindow(hourIso: string, pm25: Pm25UgM3): TimelineWindow {
  return {
    startIndex: 0,
    endIndex: 0,
    startHour: hourIso,
    endHour: hourIso,
    averagePm25: pm25,
    recommendation: 'Single point available; continue normal precautions.',
  };
}

function buildWindow(
  timeline: readonly TimelineForecastPoint[],
  start: number,
  length: number,
  isBest: boolean,
): TimelineWindow {
  const avg = computeWindowAverage(timeline, start, length);
  const roundedAvg = createPm25UgM3(Math.round(avg * 10) / 10);
  const end = start + length - 1;
  const startPoint = getTimelinePointAt(timeline, start);
  const endPoint = getTimelinePointAt(timeline, end);

  const rec = isBest
    ? `Optimal window for essential errands and quick ventilation (${String(roundedAvg)} µg/m³).`
    : `Hazardous peak pollution window (${String(roundedAvg)} µg/m³). Avoid outdoor exposure.`;

  return {
    startIndex: start,
    endIndex: end,
    startHour: startPoint.hourIso,
    endHour: endPoint.hourIso,
    averagePm25: roundedAvg,
    recommendation: rec,
  };
}

/**
 * Evaluates a timeline forecast to locate the lowest-risk and highest-risk contiguous windows.
 *
 * @param timeline - Consecutive hourly forecast readings.
 * @param windowSizeHours - Duration of the rolling window in hours (defaults to 3).
 * @returns Both the best and avoid windows.
 */
export function analyzeTimelineWindows(
  timeline: readonly TimelineForecastPoint[],
  windowSizeHours: number = DEFAULT_WINDOW_SIZE_HOURS,
): TimelineWindows {
  if (timeline.length === 0) {
    const fallback = buildFallbackWindow('N/A', createPm25UgM3(0));
    return { bestWindow: fallback, avoidWindow: fallback };
  }

  const k = Math.min(Math.max(1, windowSizeHours), timeline.length);
  let minIdx = 0;
  let maxIdx = 0;
  let minAvg = computeWindowAverage(timeline, 0, k);
  let maxAvg = minAvg;

  for (let i = 1; i <= timeline.length - k; i++) {
    const currentAvg = computeWindowAverage(timeline, i, k);
    if (currentAvg < minAvg) {
      minAvg = currentAvg;
      minIdx = i;
    }
    if (currentAvg > maxAvg) {
      maxAvg = currentAvg;
      maxIdx = i;
    }
  }

  return {
    bestWindow: buildWindow(timeline, minIdx, k, true),
    avoidWindow: buildWindow(timeline, maxIdx, k, false),
  };
}
