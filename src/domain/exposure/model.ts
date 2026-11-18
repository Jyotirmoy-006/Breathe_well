/**
 * @file model.ts
 * @description Pure deterministic 24-hour inhaled PM2.5 exposure simulation model.
 */

import type { CommuteMode } from '../profile/types';
import { createPm25UgM3 } from '../types';
import type { Percentage } from '../types';

import {
  DEFAULT_COMMUTE_HOURS,
  DEFAULT_OUTDOOR_HOURS,
  INFILTRATION_INDOORS_HOME_NO_PURIFIER,
  INFILTRATION_INDOORS_HOME_WITH_PURIFIER,
  INFILTRATION_OUTDOORS,
  INFILTRATION_TRANSIT_CAR_RECIRC,
  INFILTRATION_TRANSIT_METRO,
  INFILTRATION_TRANSIT_OPEN,
} from './constants';
import type {
  ExposureMicroenvironment,
  ExposureModelInput,
  ExposureModelResult,
  HourlyExposurePoint,
} from './types';

function resolveMicroenvironment(
  hour: number,
  commuteMode: CommuteMode,
  commuteHours: readonly number[],
  outdoorHours: readonly number[],
): ExposureMicroenvironment {
  if (commuteMode !== 'wfh' && commuteHours.includes(hour)) {
    return 'transit';
  }
  if (outdoorHours.includes(hour)) {
    return 'outdoors';
  }
  return 'indoors_home';
}

function resolveInfiltrationFactor(
  env: ExposureMicroenvironment,
  commuteMode: CommuteMode,
  hasPurifier: boolean,
): number {
  if (env === 'outdoors') {
    return INFILTRATION_OUTDOORS;
  }
  if (env === 'indoors_home') {
    return hasPurifier
      ? INFILTRATION_INDOORS_HOME_WITH_PURIFIER
      : INFILTRATION_INDOORS_HOME_NO_PURIFIER;
  }
  if (commuteMode === 'metro_bus') {
    return INFILTRATION_TRANSIT_METRO;
  }
  if (commuteMode === 'car_ac') {
    return INFILTRATION_TRANSIT_CAR_RECIRC;
  }
  return INFILTRATION_TRANSIT_OPEN;
}

function computeHourlyPoint(
  hour: number,
  ambientPm25: number,
  factor: number,
  mitigationFraction: number,
): { baseline: number; mitigated: number } {
  const baseline = ambientPm25 * factor;
  const mitigated = baseline * (1 - mitigationFraction);
  return { baseline, mitigated };
}

/**
 * Computes 24-hour inhaled PM2.5 exposure based on user activities and ambient levels.
 *
 * @param input - Exposure model configuration parameters.
 * @returns Comprehensive exposure metrics and hourly breakdown.
 */
export function computeDailyExposure(input: ExposureModelInput): ExposureModelResult {
  const commuteHours = input.commuteHours ?? DEFAULT_COMMUTE_HOURS;
  const outdoorHours = input.outdoorHours ?? DEFAULT_OUTDOOR_HOURS;
  const mitigationFraction = Math.max(0, Math.min(100, input.actionMitigationPct ?? 0)) / 100;

  let totalBaseline = 0;
  let totalMitigated = 0;
  const points: HourlyExposurePoint[] = [];

  for (const point of input.hourlyAmbient) {
    const env = resolveMicroenvironment(
      point.hour,
      input.profile.commuteMode,
      commuteHours,
      outdoorHours,
    );
    const factor = resolveInfiltrationFactor(
      env,
      input.profile.commuteMode,
      input.profile.hasAirPurifier,
    );
    const { baseline, mitigated } = computeHourlyPoint(
      point.hour,
      point.ambientPm25,
      factor,
      mitigationFraction,
    );

    totalBaseline += baseline;
    totalMitigated += mitigated;
    points.push({
      hour: point.hour,
      microenvironment: env,
      ambientPm25: point.ambientPm25,
      baselineInhaledPm25: createPm25UgM3(Math.round(baseline * 10) / 10),
      mitigatedInhaledPm25: createPm25UgM3(Math.round(mitigated * 10) / 10),
    });
  }

  const hoursCount = points.length > 0 ? points.length : 1;
  const reductionRaw =
    totalBaseline > 0 ? ((totalBaseline - totalMitigated) / totalBaseline) * 100 : 0;
  const reduction = (Math.round(reductionRaw * 10) / 10) as Percentage;

  return {
    baselineExposureUgM3Hours: Math.round(totalBaseline * 10) / 10,
    mitigatedExposureUgM3Hours: Math.round(totalMitigated * 10) / 10,
    reductionPercentage: reduction,
    averageBaselineInhaledPm25: createPm25UgM3(Math.round((totalBaseline / hoursCount) * 10) / 10),
    averageMitigatedInhaledPm25: createPm25UgM3(
      Math.round((totalMitigated / hoursCount) * 10) / 10,
    ),
    hourlyPoints: points,
  };
}
