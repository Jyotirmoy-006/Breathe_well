/**
 * @file index.ts
 * @description Central export point for AQI domain primitives, constants, and computation functions.
 */

export {
  WHO_PM25_24H_GUIDELINE_UG_M3,
  CPCB_PM25_BREAKPOINTS_UG_M3,
  CPCB_SUBINDEX_BREAKPOINTS,
} from './constants';
export type { AqiCategory, CpcbBreakpointUgM3, CpcbSubIndexBreakpoint } from './constants';

export { computeCpcbSubIndex } from './subindex';

export {
  computeCpcbCategory,
  computeWhoMultiple,
  getAqiCategoryVerdict,
  getAqiHealthRecommendation,
} from './category';

export { createAqiIndex, createPm25UgM3 } from '../types';
export type { AqiIndex, Pm25UgM3 } from '../types';
