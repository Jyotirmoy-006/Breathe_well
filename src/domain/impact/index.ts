/**
 * @file index.ts
 * @description Central export point for combined impact modeling and constants.
 */

export type { MetricRange, CombinedImpact } from './types';

export { MAX_PHYSICAL_EXPOSURE_REDUCTION_PCT, WEEKS_PER_YEAR } from './constants';

export { combineActionImpacts } from './model';
