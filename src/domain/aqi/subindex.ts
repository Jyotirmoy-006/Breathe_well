/**
 * @file subindex.ts
 * @description Pure function computing CPCB sub-index from PM2.5 concentration.
 */

import { createAqiIndex } from '../types';
import type { AqiIndex, Pm25UgM3 } from '../types';

import { CPCB_SUBINDEX_BREAKPOINTS } from './constants';
import type { CpcbSubIndexBreakpoint } from './constants';

const SEVERE_BREAKPOINT: CpcbSubIndexBreakpoint = {
  bLoUgM3: 251,
  bHiUgM3: 350,
  iLoAqi: 401,
  iHiAqi: 500,
  category: 'Severe',
};

/**
 * Finds the corresponding CPCB sub-index breakpoint for a rounded concentration.
 * @param c - Integer PM2.5 concentration.
 */
export function findBreakpoint(c: number): CpcbSubIndexBreakpoint {
  for (const bp of CPCB_SUBINDEX_BREAKPOINTS) {
    if (c <= bp.bHiUgM3) {
      return bp;
    }
  }
  return SEVERE_BREAKPOINT;
}

/**
 * Computes the CPCB AQI sub-index for PM2.5 using linear interpolation.
 * Formula: I = [ (I_hi - I_lo) / (B_hi - B_lo) ] * (C - B_lo) + I_lo
 * Per CPCB guidelines, concentration is rounded to nearest integer first.
 *
 * @param pm25 - PM2.5 concentration in µg/m³.
 * @returns Branded AqiIndex between 0 and 500.
 */
export function computeCpcbSubIndex(pm25: Pm25UgM3): AqiIndex {
  if (Number.isNaN(pm25) || pm25 <= 0) {
    return createAqiIndex(0);
  }

  const c = Math.round(pm25);
  const bp = findBreakpoint(c);
  if (c >= 350) {
    return createAqiIndex(500);
  }

  const factor = (bp.iHiAqi - bp.iLoAqi) / (bp.bHiUgM3 - bp.bLoUgM3);
  const index = Math.round(factor * (c - bp.bLoUgM3) + bp.iLoAqi);

  return createAqiIndex(Math.min(500, Math.max(0, index)));
}
