/**
 * @file index.ts
 * @description Core AQI domain logic: branded types, category computation, WHO multiple.
 */

import { CPCB_PM25_BREAKPOINTS_UG_M3, WHO_PM25_24H_GUIDELINE_UG_M3 } from './constants';

// ---------------------------------------------------------------------------
// Branded primitive types
// ---------------------------------------------------------------------------

/** Nominal brand marker — not used at runtime. */
declare const __brand: unique symbol;

/** Utility type for creating branded primitives. */
type Brand<T, B> = T & { readonly [__brand]: B };

/**
 * Branded number representing an Air Quality Index (AQI) value.
 * Use `createAqiIndex` to construct safely.
 */
export type AqiIndex = Brand<number, 'AqiIndex'>;

/**
 * Branded number representing a PM2.5 concentration in µg/m³.
 * Use `createPm25UgM3` to construct safely.
 */
export type Pm25UgM3 = Brand<number, 'Pm25UgM3'>;

// ---------------------------------------------------------------------------
// Category union type
// ---------------------------------------------------------------------------

/**
 * CPCB air quality category labels for PM2.5.
 * Maps to the six CPCB breakpoint ranges defined in constants.ts.
 */
export type AqiCategory = 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';

// ---------------------------------------------------------------------------
// Constructor helpers
// ---------------------------------------------------------------------------

/**
 * Constructs a branded `AqiIndex` from a raw number.
 * @param value - Raw AQI numeric value (must be ≥ 0).
 */
export function createAqiIndex(value: number): AqiIndex {
  return value as AqiIndex;
}

/**
 * Constructs a branded `Pm25UgM3` from a raw number.
 * @param value - Raw PM2.5 concentration in µg/m³ (must be ≥ 0).
 */
export function createPm25UgM3(value: number): Pm25UgM3 {
  return value as Pm25UgM3;
}

// ---------------------------------------------------------------------------
// Pure computation functions
// ---------------------------------------------------------------------------

/**
 * Computes the CPCB air quality category for a given PM2.5 concentration.
 *
 * Breakpoints (µg/m³):
 * - 0–30:    Good
 * - 31–60:   Satisfactory
 * - 61–90:   Moderate
 * - 91–120:  Poor
 * - 121–250: Very Poor
 * - >250:    Severe
 *
 * @param pm25 - PM2.5 concentration in µg/m³ as a branded `Pm25UgM3`.
 * @returns The corresponding `AqiCategory`.
 */
export function computeCpcbCategory(pm25: Pm25UgM3): AqiCategory {
  for (const bp of CPCB_PM25_BREAKPOINTS_UG_M3) {
    if (pm25 <= bp.hiUgM3) {
      return bp.category as AqiCategory;
    }
  }
  // Fallback — should never be reached given Infinity upper bound on last entry
  return 'Severe';
}

/**
 * Computes how many times the given PM2.5 concentration exceeds the
 * WHO 2021 24-hour PM2.5 guideline (15 µg/m³).
 *
 * A value of 1.0 means exactly at the guideline; 2.0 means twice the guideline.
 *
 * @param pm25 - PM2.5 concentration in µg/m³ as a branded `Pm25UgM3`.
 * @returns Ratio of pm25 to WHO_PM25_24H_GUIDELINE_UG_M3.
 */
export function computeWhoMultiple(pm25: Pm25UgM3): number {
  return pm25 / WHO_PM25_24H_GUIDELINE_UG_M3;
}
