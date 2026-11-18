/**
 * @file journalState.test.ts
 * @description Unit tests for useJournalState hook and journalBaseline data generators.
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BASELINE_LIVE_METRICS,
  computeBaselineWindows,
  generateBaselineHourly,
} from '@/features/journal/journalBaseline';
import { useJournalState } from '@/features/journal/useJournalState';

describe('journalBaseline', () => {
  it('generates 48 hours of timeline data with diurnal smog profile', () => {
    const hourly = generateBaselineHourly();
    expect(hourly).toHaveLength(48);

    const firstHour = hourly[0]!;
    expect(firstHour).toHaveProperty('hourIso');
    expect(firstHour).toHaveProperty('pm25');
    expect(firstHour).toHaveProperty('cpcbCategory');

    const windows = computeBaselineWindows(hourly);
    expect(windows.bestWindow).toBeDefined();
    expect(windows.avoidWindow).toBeDefined();
  });
});

describe('useJournalState', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('initializes with baseline metrics, presets, and actions', () => {
    const { result } = renderHook(() => useJournalState());

    expect(result.current.location.name).toContain('Delhi');
    expect(result.current.liveMetrics.cpcbCategory).toBe(BASELINE_LIVE_METRICS.cpcbCategory);
    expect(result.current.hourly).toHaveLength(48);
    expect(result.current.selectedActionIds.size).toBeGreaterThan(0);
  });

  it('toggles actions on and off, and supports selectAll / deselectAll', () => {
    const { result } = renderHook(() => useJournalState());
    const firstActionId = result.current.allActions[0]!.id;

    // Toggle off
    act(() => {
      result.current.toggleAction(firstActionId);
    });
    expect(result.current.selectedActionIds.has(firstActionId)).toBe(false);

    // Toggle on
    act(() => {
      result.current.toggleAction(firstActionId);
    });
    expect(result.current.selectedActionIds.has(firstActionId)).toBe(true);

    // Deselect all
    act(() => {
      result.current.deselectAllActions();
    });
    expect(result.current.selectedActionIds.size).toBe(0);

    // Select all
    act(() => {
      result.current.selectAllActions();
    });
    expect(result.current.selectedActionIds.size).toBe(result.current.allActions.length);
  });

  it('updates state when changing location, scrubberIndex, and locale', async () => {
    const mockApiResponse = {
      live: {
        ...BASELINE_LIVE_METRICS,
        currentPm25: 140,
        cpcbCategory: 'Poor' as const,
      },
      hourly: generateBaselineHourly(),
      weatherExplainer: null,
    };

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockApiResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const { result } = renderHook(() => useJournalState());

    act(() => {
      result.current.setScrubberIndex(5);
      result.current.setLocale('hi');
      result.current.setLocation({
        id: 1264733,
        name: 'Lucknow',
        latitude: 26.84,
        longitude: 80.94,
        country: 'India',
      });
    });

    expect(result.current.scrubberIndex).toBe(5);
    expect(result.current.locale).toBe('hi');

    await waitFor(() => {
      expect(result.current.liveMetrics.currentPm25).toBe(140);
    });
  });
});
