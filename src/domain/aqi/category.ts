/**
 * @file category.ts
 * @description Pure functions for CPCB AQI category classification, verdicts, and WHO multiple calculations.
 */

import type { Pm25UgM3 } from '../types';

import { CPCB_PM25_BREAKPOINTS_UG_M3, WHO_PM25_24H_GUIDELINE_UG_M3 } from './constants';
import type { AqiCategory } from './constants';

const CATEGORY_VERDICTS: Record<AqiCategory, string> = {
  Good: 'Air quality is good with minimal health impact.',
  Satisfactory: 'Air quality is acceptable; minor discomfort for sensitive individuals.',
  Moderate: 'Air quality is moderately polluted; may cause breathing discomfort.',
  Poor: 'Air quality is poor; prolonged exposure causes breathing discomfort.',
  'Very Poor': 'Air quality is very poor; may trigger respiratory illness.',
  Severe: 'Air quality is severe; healthy individuals may experience serious health impacts.',
};

const CATEGORY_RECOMMENDATIONS: Record<AqiCategory, string> = {
  Good: 'Enjoy outdoor activities; keep indoor ventilation regular.',
  Satisfactory: 'Sensitive individuals should monitor respiratory symptoms.',
  Moderate: 'Children, elderly, and sensitive groups should limit strenuous outdoor activity.',
  Poor: 'Limit prolonged outdoor exertion; use N95 masks when commuting.',
  'Very Poor': 'Avoid non-essential outdoor exertion; run indoor air filtration.',
  Severe: 'Remain indoors; keep windows sealed and run air purification continuously.',
};

/**
 * Computes the CPCB air quality category for a given PM2.5 concentration.
 *
 * @param pm25 - PM2.5 concentration in µg/m³.
 * @returns The corresponding AqiCategory.
 */
export function computeCpcbCategory(pm25: Pm25UgM3): AqiCategory {
  for (const bp of CPCB_PM25_BREAKPOINTS_UG_M3) {
    if (pm25 <= bp.hiUgM3) {
      return bp.category;
    }
  }
  return 'Severe';
}

/**
 * Computes the multiple of the WHO 2021 24-hour PM2.5 guideline (15 µg/m³).
 *
 * @param pm25 - PM2.5 concentration in µg/m³.
 * @returns Ratio of concentration to WHO guideline.
 */
export function computeWhoMultiple(pm25: Pm25UgM3): number {
  return pm25 / WHO_PM25_24H_GUIDELINE_UG_M3;
}

/**
 * Returns a concise plain-language verdict for the given AQI category.
 *
 * @param category - CPCB air quality category.
 */
export function getAqiCategoryVerdict(category: AqiCategory): string {
  return CATEGORY_VERDICTS[category];
}

/**
 * Returns a practical health recommendation for the given AQI category.
 *
 * @param category - CPCB air quality category.
 */
export function getAqiHealthRecommendation(category: AqiCategory): string {
  return CATEGORY_RECOMMENDATIONS[category];
}
