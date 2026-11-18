/**
 * @file validation.ts
 * @description Zod schema and pure validation function for UserProfile.
 */

import { z } from 'zod';

import { err, ok } from '../result';
import type { Result } from '../result';

import type { UserProfile } from './types';

/**
 * Zod validation schema for UserProfile domain entity.
 */
export const profileSchema = z.object({
  householdSize: z
    .number()
    .int('Household size must be an integer')
    .min(1, 'Household size must be at least 1')
    .max(20, 'Household size cannot exceed 20'),
  children: z.boolean(),
  elderly: z.boolean(),
  sensitiveGroup: z.boolean(),
  homeType: z.enum(['apartment', 'independent', 'hostel']),
  commuteMode: z.enum(['metro_bus', 'walk_cycle', 'two_wheeler', 'car_ac', 'wfh']),
  cookingFuel: z.enum(['lpg_induction', 'biomass_coal', 'electric']),
  heatingMethod: z.enum(['electric_heater', 'wood_angithi', 'none']),
  hasAirPurifier: z.boolean(),
  budget: z.enum(['free', 'low', 'flexible']),
});

/**
 * Validates unknown data against the profile schema without throwing exceptions.
 *
 * @param raw - Input candidate to validate.
 * @returns Result<UserProfile, string> containing validated profile or error messages.
 */
export function validateProfile(raw: unknown): Result<UserProfile, string> {
  const parseResult = profileSchema.safeParse(raw);
  if (!parseResult.success) {
    const messages = parseResult.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    return err(messages);
  }
  return ok(parseResult.data);
}
