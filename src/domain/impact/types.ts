/**
 * @file types.ts
 * @description Types representing aggregate multi-action impact results and methodology disclosures.
 */

import type { ActionConfidence } from '../catalog/types';
import type { KgCo2e, Percentage } from '../types';

/** Range representing lower and upper bounds of an estimated metric. */
export interface MetricRange<T> {
  readonly low: T;
  readonly high: T;
}

/** Aggregate impact across a chosen set of actions. */
export interface CombinedImpact {
  /** Multiplicative combined PM2.5 exposure reduction percentage range. */
  readonly exposureReductionPct: MetricRange<Percentage>;
  /** Additive weekly greenhouse gas savings in kg CO2e. */
  readonly co2eKgPerWeek: MetricRange<KgCo2e>;
  /** Additive annual greenhouse gas savings in kg CO2e. */
  readonly co2eKgPerYear: MetricRange<KgCo2e>;
  /** Overall empirical confidence level. */
  readonly confidence: ActionConfidence;
  /** Detailed plain-language methodology and transparency disclosures. */
  readonly basis: string;
  /** Total number of interventions contributing to this combined impact. */
  readonly actionCount: number;
}
