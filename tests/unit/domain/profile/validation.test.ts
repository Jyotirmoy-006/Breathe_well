/**
 * @file validation.test.ts
 * @description Unit tests for user profile validation, edge cases, and preset configurations.
 */

import { describe, expect, it } from 'vitest';

import { PROFILE_PRESETS, getPresetById, profileSchema, validateProfile } from '@/domain/profile';
import type { UserProfile } from '@/domain/profile';
import { isErr, isOk } from '@/domain/result';

describe('Profile Validation & Presets', () => {
  const validProfile: UserProfile = {
    householdSize: 4,
    children: true,
    elderly: false,
    sensitiveGroup: true,
    homeType: 'apartment',
    commuteMode: 'car_ac',
    cookingFuel: 'lpg_induction',
    heatingMethod: 'electric_heater',
    hasAirPurifier: true,
    budget: 'flexible',
  };

  it('validates a correct profile successfully', () => {
    const result = validateProfile(validProfile);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.householdSize).toBe(4);
      expect(result.value.homeType).toBe('apartment');
    }
  });

  it('rejects householdSize < 1', () => {
    const invalid = { ...validProfile, householdSize: 0 };
    const result = validateProfile(invalid);
    expect(isErr(result)).toBe(true);
  });

  it('rejects householdSize > 20', () => {
    const invalid = { ...validProfile, householdSize: 21 };
    const result = validateProfile(invalid);
    expect(isErr(result)).toBe(true);
  });

  it('rejects non-integer householdSize', () => {
    const invalid = { ...validProfile, householdSize: 3.5 };
    const result = validateProfile(invalid);
    expect(isErr(result)).toBe(true);
  });

  it('rejects invalid enum values', () => {
    expect(isErr(validateProfile({ ...validProfile, homeType: 'mansion' }))).toBe(true);
    expect(isErr(validateProfile({ ...validProfile, commuteMode: 'helicopter' }))).toBe(true);
    expect(isErr(validateProfile({ ...validProfile, cookingFuel: 'kerosene' }))).toBe(true);
    expect(isErr(validateProfile({ ...validProfile, heatingMethod: 'fireplace' }))).toBe(true);
    expect(isErr(validateProfile({ ...validProfile, budget: 'unlimited' }))).toBe(true);
  });

  it('rejects missing or malformed data', () => {
    expect(isErr(validateProfile(null))).toBe(true);
    expect(isErr(validateProfile({}))).toBe(true);
    expect(isErr(validateProfile('not-an-object'))).toBe(true);
  });

  it('contains exactly 4 vetted presets', () => {
    expect(PROFILE_PRESETS).toHaveLength(4);
    const presetIds = PROFILE_PRESETS.map((p) => p.id);
    expect(presetIds).toEqual([
      'family-with-kids',
      'elderly-at-home',
      'daily-commuter',
      'hostel-student',
    ]);
  });

  it('ensures all 4 presets strictly satisfy the profile schema', () => {
    for (const preset of PROFILE_PRESETS) {
      const parsed = profileSchema.safeParse(preset.profile);
      expect(parsed.success).toBe(true);
    }
  });

  it('finds preset by ID and returns undefined for unknown ID', () => {
    const found = getPresetById('family-with-kids');
    expect(found).toBeDefined();
    expect(found?.name).toBe('Family with kids');

    const notFound = getPresetById('unknown-id');
    expect(notFound).toBeUndefined();
  });
});
