/**
 * @file types.ts
 * @description Types for inhaled PM2.5 microenvironmental exposure modeling.
 */

import type { UserProfile } from '../profile/types';
import type { HourOfDay, Percentage, Pm25UgM3 } from '../types';

/** Microenvironment classification for daily activity locations. */
export type ExposureMicroenvironment = 'indoors_home' | 'transit' | 'outdoors';

/** Ambient PM2.5 concentration at a specific hour of the day. */
export interface HourlyAmbientPoint {
  readonly hour: HourOfDay;
  readonly ambientPm25: Pm25UgM3;
}

/** Inhaled exposure calculation for a single hour. */
export interface HourlyExposurePoint {
  readonly hour: HourOfDay;
  readonly microenvironment: ExposureMicroenvironment;
  readonly ambientPm25: Pm25UgM3;
  readonly baselineInhaledPm25: Pm25UgM3;
  readonly mitigatedInhaledPm25: Pm25UgM3;
}

/** Parameters required by the 24-hour inhaled exposure model. */
export interface ExposureModelInput {
  readonly profile: Pick<UserProfile, 'hasAirPurifier' | 'commuteMode'>;
  readonly hourlyAmbient: readonly HourlyAmbientPoint[];
  readonly commuteHours?: readonly number[] | undefined;
  readonly outdoorHours?: readonly number[] | undefined;
  readonly actionMitigationPct?: Percentage | undefined;
}

/** Output results of the 24-hour inhaled exposure model. */
export interface ExposureModelResult {
  /** Baseline daily inhaled exposure in µg/m³·hours. */
  readonly baselineExposureUgM3Hours: number;
  /** Mitigated daily inhaled exposure in µg/m³·hours after actions. */
  readonly mitigatedExposureUgM3Hours: number;
  /** Percentage reduction achieved. */
  readonly reductionPercentage: Percentage;
  /** 24-hour time-weighted average baseline inhaled PM2.5 in µg/m³. */
  readonly averageBaselineInhaledPm25: Pm25UgM3;
  /** 24-hour time-weighted average mitigated inhaled PM2.5 in µg/m³. */
  readonly averageMitigatedInhaledPm25: Pm25UgM3;
  /** Detailed hour-by-hour breakdown. */
  readonly hourlyPoints: readonly HourlyExposurePoint[];
}
