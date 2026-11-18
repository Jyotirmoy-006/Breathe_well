/**
 * @file constants.ts
 * @description Named constants for CPCB AQI and PM2.5 calculation formulas.
 * All constants include units in their names for absolute clarity.
 */

/**
 * WHO 2021 PM2.5 24-hour mean guideline in micrograms per cubic metre.
 * Reference: WHO Global Air Quality Guidelines 2021.
 */
export const WHO_PM25_24H_GUIDELINE_UG_M3 = 15 as const;

/**
 * CPCB air quality category labels for PM2.5.
 */
export type AqiCategory = 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';

/**
 * A single CPCB PM2.5 breakpoint entry for category determination.
 */
export interface CpcbBreakpointUgM3 {
  /** Lower bound of PM2.5 concentration in µg/m³ (inclusive). */
  readonly loUgM3: number;
  /** Upper bound of PM2.5 concentration in µg/m³ (inclusive). */
  readonly hiUgM3: number;
  /** Human-readable category label. */
  readonly category: AqiCategory;
}

/**
 * CPCB (Central Pollution Control Board) PM2.5 breakpoints in µg/m³.
 * Based on India's National Air Quality Index standard.
 */
export const CPCB_PM25_BREAKPOINTS_UG_M3: readonly CpcbBreakpointUgM3[] = [
  { loUgM3: 0, hiUgM3: 30, category: 'Good' },
  { loUgM3: 31, hiUgM3: 60, category: 'Satisfactory' },
  { loUgM3: 61, hiUgM3: 90, category: 'Moderate' },
  { loUgM3: 91, hiUgM3: 120, category: 'Poor' },
  { loUgM3: 121, hiUgM3: 250, category: 'Very Poor' },
  { loUgM3: 251, hiUgM3: Infinity, category: 'Severe' },
] as const;

/**
 * Breakpoint entry for CPCB sub-index linear interpolation formula.
 * Formula: I = [(I_hi - I_lo)/(B_hi - B_lo)] * (C - B_lo) + I_lo
 */
export interface CpcbSubIndexBreakpoint {
  readonly bLoUgM3: number;
  readonly bHiUgM3: number;
  readonly iLoAqi: number;
  readonly iHiAqi: number;
  readonly category: AqiCategory;
}

/**
 * CPCB PM2.5 sub-index breakpoints mapping PM2.5 concentrations to AQI sub-indices.
 */
export const CPCB_SUBINDEX_BREAKPOINTS: readonly CpcbSubIndexBreakpoint[] = [
  { bLoUgM3: 0, bHiUgM3: 30, iLoAqi: 0, iHiAqi: 50, category: 'Good' },
  { bLoUgM3: 31, bHiUgM3: 60, iLoAqi: 51, iHiAqi: 100, category: 'Satisfactory' },
  { bLoUgM3: 61, bHiUgM3: 90, iLoAqi: 101, iHiAqi: 200, category: 'Moderate' },
  { bLoUgM3: 91, bHiUgM3: 120, iLoAqi: 201, iHiAqi: 300, category: 'Poor' },
  { bLoUgM3: 121, bHiUgM3: 250, iLoAqi: 301, iHiAqi: 400, category: 'Very Poor' },
  { bLoUgM3: 251, bHiUgM3: 350, iLoAqi: 401, iHiAqi: 500, category: 'Severe' },
] as const;
