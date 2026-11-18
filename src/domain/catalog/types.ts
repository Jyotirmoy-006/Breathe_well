/**
 * @file types.ts
 * @description Type definitions and Zod schemas for the air pollution action catalog.
 */

import { z } from 'zod';

/** Category classification for air mitigation interventions. */
export type ActionCategory = 'routine' | 'home' | 'swap' | 'community';

/** Effort score required to execute the action: 1 (low), 2 (medium), 3 (high). */
export type ActionEffort = 1 | 2 | 3;

/** Direct monetary cost to the user: 'free', 'low', 'medium', 'high'. */
export type ActionCost = 'free' | 'low' | 'medium' | 'high';

/** Scheduling window within a daily cycle. */
export type ActionTimeBlock = 'morning' | 'commute' | 'midday' | 'evening' | 'night' | 'all_day';

/** Confidence tier of empirical evidence backing the action. */
export type ActionConfidence = 'high' | 'medium' | 'assumption';

/** Rules determining whether an action applies to a specific user profile and AQI. */
export interface ActionEligibilityRules {
  readonly needsCar?: boolean;
  readonly needsTwoWheeler?: boolean;
  readonly needsHeating?: boolean;
  readonly hasPurifier?: boolean;
  readonly maxBudget?: 'free' | 'low' | 'medium' | 'high';
  readonly minAqiCategory?: readonly string[];
}

/** Quantitative impact coefficients for exposure reduction and carbon savings. */
export interface ActionCoefficients {
  readonly pm25ExposureReductionPct: {
    readonly low: number;
    readonly high: number;
  };
  readonly co2eKgPerWeek: {
    readonly low: number;
    readonly high: number;
  };
  readonly basis: string;
  readonly confidence: ActionConfidence;
}

/** Complete catalog entry representation. */
export interface ActionCatalogEntry {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: ActionCategory;
  readonly effort: ActionEffort;
  readonly cost: ActionCost;
  readonly timeBlock: ActionTimeBlock;
  readonly eligibilityRules: ActionEligibilityRules;
  readonly coefficients: ActionCoefficients;
  readonly evidenceNotes: string;
}

/** Zod schema validating ActionCategory enum. */
export const actionCategorySchema = z.enum(['routine', 'home', 'swap', 'community']);

/** Zod schema validating ActionEffort rating. */
export const actionEffortSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

/** Zod schema validating ActionCost tier. */
export const actionCostSchema = z.enum(['free', 'low', 'medium', 'high']);

/** Zod schema validating ActionTimeBlock window. */
export const actionTimeBlockSchema = z.enum([
  'morning',
  'commute',
  'midday',
  'evening',
  'night',
  'all_day',
]);

/** Zod schema validating ActionConfidence tier. */
export const actionConfidenceSchema = z.enum(['high', 'medium', 'assumption']);

/** Zod schema validating ActionEligibilityRules. */
export const actionEligibilityRulesSchema = z.object({
  needsCar: z.boolean().optional(),
  needsTwoWheeler: z.boolean().optional(),
  needsHeating: z.boolean().optional(),
  hasPurifier: z.boolean().optional(),
  maxBudget: z.enum(['free', 'low', 'medium', 'high']).optional(),
  minAqiCategory: z.array(z.string()).readonly().optional(),
});

/** Zod schema validating ActionCoefficients. */
export const actionCoefficientsSchema = z.object({
  pm25ExposureReductionPct: z.object({
    low: z.number().min(0).max(100),
    high: z.number().min(0).max(100),
  }),
  co2eKgPerWeek: z.object({
    low: z.number().min(0),
    high: z.number(),
  }),
  basis: z.string().min(1),
  confidence: actionConfidenceSchema,
});

/** Zod schema validating a complete ActionCatalogEntry. */
export const actionCatalogEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Must be kebab-case'),
  title: z.string().min(3),
  description: z.string().min(10),
  category: actionCategorySchema,
  effort: actionEffortSchema,
  cost: actionCostSchema,
  timeBlock: actionTimeBlockSchema,
  eligibilityRules: actionEligibilityRulesSchema,
  coefficients: actionCoefficientsSchema,
  evidenceNotes: z.string().min(5),
});
