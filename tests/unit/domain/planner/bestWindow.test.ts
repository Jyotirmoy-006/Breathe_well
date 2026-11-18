/**
 * @file bestWindow.test.ts
 * @description Unit tests for 48-hour timeline window analysis and peak/trough detection.
 */

import { describe, expect, it } from 'vitest';

import { createPm25UgM3 } from '@/domain/aqi';
import { analyzeTimelineWindows, getTimelinePointAt } from '@/domain/planner';
import type { TimelineForecastPoint } from '@/domain/planner';

function createMockTimeline(values: number[]): TimelineForecastPoint[] {
  return values.map((val, idx) => ({
    hourIso: `2026-11-18T${String(idx).padStart(2, '0')}:00:00Z`,
    pm25: createPm25UgM3(val),
  }));
}

describe('analyzeTimelineWindows', () => {
  it('correctly identifies lowest trough and highest peak in a diurnal cycle', () => {
    // 12-hour synthetic cycle: morning peak at index 2 (300), midday trough at index 6 (50)
    const values = [150, 250, 300, 280, 180, 90, 50, 55, 60, 140, 220, 290];
    const timeline = createMockTimeline(values);

    const result = analyzeTimelineWindows(timeline, 3);

    expect(result.bestWindow.averagePm25).toBeLessThan(70);
    expect(result.bestWindow.startIndex).toBeGreaterThanOrEqual(4);
    expect(result.bestWindow.endIndex).toBeLessThanOrEqual(8);

    expect(result.avoidWindow.averagePm25).toBeGreaterThan(250);
    expect(result.avoidWindow.startIndex).toBeLessThanOrEqual(2);
  });

  it('handles flat timeline gracefully', () => {
    const timeline = createMockTimeline([100, 100, 100, 100, 100, 100]);
    const result = analyzeTimelineWindows(timeline, 3);

    expect(result.bestWindow.averagePm25).toBe(100);
    expect(result.avoidWindow.averagePm25).toBe(100);
    expect(result.bestWindow.startIndex).toBe(0);
    expect(result.avoidWindow.startIndex).toBe(0);
  });

  it('handles strictly increasing monotonic timeline', () => {
    const timeline = createMockTimeline([10, 20, 30, 40, 50, 60]);
    const result = analyzeTimelineWindows(timeline, 3);

    expect(result.bestWindow.startIndex).toBe(0);
    expect(result.bestWindow.averagePm25).toBe(20);
    expect(result.avoidWindow.startIndex).toBe(3);
    expect(result.avoidWindow.averagePm25).toBe(50);
  });

  it('handles strictly decreasing monotonic timeline', () => {
    const timeline = createMockTimeline([60, 50, 40, 30, 20, 10]);
    const result = analyzeTimelineWindows(timeline, 3);

    expect(result.bestWindow.startIndex).toBe(3);
    expect(result.bestWindow.averagePm25).toBe(20);
    expect(result.avoidWindow.startIndex).toBe(0);
    expect(result.avoidWindow.averagePm25).toBe(50);
  });

  it('handles empty timeline safely with fallback', () => {
    const result = analyzeTimelineWindows([]);
    expect(result.bestWindow.startHour).toBe('N/A');
    expect(result.bestWindow.averagePm25).toBe(0);
    expect(result.avoidWindow.startHour).toBe('N/A');
  });

  it('handles timeline shorter than window size', () => {
    const timeline = createMockTimeline([80, 120]);
    const result = analyzeTimelineWindows(timeline, 3);

    expect(result.bestWindow.startIndex).toBe(0);
    expect(result.bestWindow.endIndex).toBe(1);
    expect(result.bestWindow.averagePm25).toBe(100);
  });

  it('getTimelinePointAt returns point for valid index and fallback for out of bounds', () => {
    const timeline = createMockTimeline([50]);
    const valid = getTimelinePointAt(timeline, 0);
    expect(valid.pm25).toBe(50);

    const outOfBounds = getTimelinePointAt(timeline, 99);
    expect(outOfBounds.hourIso).toBe('N/A');
    expect(outOfBounds.pm25).toBe(0);
  });
});
