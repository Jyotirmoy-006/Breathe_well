/**
 * @file constants.ts
 * @description Named constants for AQI and PM2.5 calculations.
 * All constants include units in their names for clarity.
 */

/**
 * WHO 2021 PM2.5 24-hour mean guideline in micrograms per cubic metre.
 * Reference: WHO Global Air Quality Guidelines 2021.
 */
export const WHO_PM25_24H_GUIDELINE_UG_M3 = 15 as const;

/**
 * A single CPCB PM2.5 breakpoint entry.
 * Defines the range [loUgM3, hiUgM3] mapped to an AQI category label.
 */
export interface CpcbBreakpointUgM3 {
  /** Lower bound of PM2.5 concentration in µg/m³ (inclusive). */
  readonly loUgM3: number;
  /** Upper bound of PM2.5 concentration in µg/m³ (inclusive). */
  readonly hiUgM3: number;
  /** Human-readable category label. */
  readonly category: string;
}

/**
 * CPCB (Central Pollution Control Board) PM2.5 breakpoints in µg/m³.
 * Based on India's National Air Quality Index standard.
 * @see https://app.cpcbccr.com/ccr/#/caaqm-dashboard-all/caaqm-landing/data
 */
export const CPCB_PM25_BREAKPOINTS_UG_M3: readonly CpcbBreakpointUgM3[] = [
  { loUgM3: 0, hiUgM3: 30, category: 'Good' },
  { loUgM3: 31, hiUgM3: 60, category: 'Satisfactory' },
  { loUgM3: 61, hiUgM3: 90, category: 'Moderate' },
  { loUgM3: 91, hiUgM3: 120, category: 'Poor' },
  { loUgM3: 121, hiUgM3: 250, category: 'Very Poor' },
  { loUgM3: 251, hiUgM3: Infinity, category: 'Severe' },
] as const;
