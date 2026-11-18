/**
 * @file types.ts
 * @description Types for the hero section including live air metrics and atmospheric explainer.
 */

import type { AqiCategory } from '@/domain/aqi/constants';
import type { WeatherExplainer } from '@/server/providers/openMeteoForecast';

export interface LiveAirMetrics {
  readonly currentPm25: number;
  readonly currentPm10: number;
  readonly currentNo2: number;
  readonly aqi: number;
  readonly cpcbCategory: AqiCategory;
  readonly whoMultiple: number;
  readonly recordedAtIso: string;
}

export interface HeroSectionProps {
  readonly liveMetrics: LiveAirMetrics;
  readonly weatherExplainer?: WeatherExplainer | null | undefined;
  readonly planMode?: 'ai' | 'rule-based' | undefined;
  readonly planModeReason?: string | undefined;
  readonly scrubberPm25?: number | null | undefined;
  readonly className?: string | undefined;
}
