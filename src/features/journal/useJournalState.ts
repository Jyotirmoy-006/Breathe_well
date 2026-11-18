/**
 * @file useJournalState.ts
 * @description Master state management hook coordinating air quality, timeline, and plan generation.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';

import { getAllActions } from '../../domain/catalog/actions';
import { generatePlan } from '../../domain/planner/engine';
import type { ActionPlan } from '../../domain/planner/types';
import { PROFILE_PRESETS } from '../../domain/profile/presets';
import type { UserProfile } from '../../domain/profile/types';
import { createPm25UgM3 } from '../../domain/types';
import type { WeatherExplainer } from '../../server/providers/openMeteoForecast';
import type { LiveAirMetrics } from '../hero/types';
import { DEFAULT_LOCATION } from '../location/types';
import type { LocationItem } from '../location/types';
import type { PlanLocale } from '../plan/types';
import type { TimelineHour } from '../timeline/types';

import {
  BASELINE_LIVE_METRICS,
  computeBaselineWindows,
  generateBaselineHourly,
} from './journalBaseline';

const INITIAL_HOURLY = generateBaselineHourly();
const INITIAL_WINDOWS = computeBaselineWindows(INITIAL_HOURLY);

interface AirQualityApiResponse {
  readonly live: LiveAirMetrics;
  readonly hourly: readonly TimelineHour[];
  readonly weatherExplainer?: WeatherExplainer | null;
}

/**
 * Coordinates all journal state: location, live metrics, forecast timeline, profile, and action plan.
 */
export function useJournalState() {
  const [location, setLocation] = useState<LocationItem>(DEFAULT_LOCATION);
  const [liveMetrics, setLiveMetrics] = useState<LiveAirMetrics>(BASELINE_LIVE_METRICS);
  const [hourly, setHourly] = useState<readonly TimelineHour[]>(INITIAL_HOURLY);
  const [windows, setWindows] = useState(INITIAL_WINDOWS);
  const [weatherExplainer, setWeatherExplainer] = useState<WeatherExplainer | null | undefined>(
    null,
  );
  const [scrubberIndex, setScrubberIndex] = useState(0);
  const [locale, setLocale] = useState<PlanLocale>('en');
  const [profile, setProfile] = useState<UserProfile>(
    PROFILE_PRESETS[0]?.profile ?? {
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
    },
  );

  const allActions = useMemo(() => getAllActions(), []);
  const [selectedActionIds, setSelectedActionIds] = useState<ReadonlySet<string>>(
    () => new Set(allActions.map((a) => a.id)),
  );

  const plan: ActionPlan = useMemo(
    () => generatePlan(profile, createPm25UgM3(liveMetrics.currentPm25)),
    [profile, liveMetrics.currentPm25],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetch(
      `/api/air-quality?lat=${String(location.latitude)}&lon=${String(location.longitude)}`,
      {
        signal: controller.signal,
      },
    )
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch air quality');
        return res.json() as Promise<AirQualityApiResponse>;
      })
      .then((data) => {
        setLiveMetrics(data.live);
        if (data.hourly.length > 0) {
          setHourly(data.hourly);
          setWindows(computeBaselineWindows(data.hourly));
        }
        if (data.weatherExplainer !== undefined) setWeatherExplainer(data.weatherExplainer);
      })
      .catch(() => {
        // Fallback safely preserved
      });

    return () => {
      controller.abort();
    };
  }, [location]);

  const toggleAction = (id: string): void => {
    setSelectedActionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return {
    location,
    setLocation,
    liveMetrics,
    hourly,
    windows,
    weatherExplainer,
    scrubberIndex,
    setScrubberIndex,
    locale,
    setLocale,
    profile,
    setProfile,
    allActions,
    selectedActionIds,
    plan,
    toggleAction,
    selectAllActions: () => {
      setSelectedActionIds(new Set(allActions.map((a) => a.id)));
    },
    deselectAllActions: () => {
      setSelectedActionIds(new Set());
    },
  };
}
