/**
 * @file presets.ts
 * @description Curated, vetted profile presets for rapid persona selection.
 */

import type { ProfilePreset } from './types';

/**
 * 4 Vetted persona presets representing common urban household scenarios.
 */
export const PROFILE_PRESETS: readonly ProfilePreset[] = [
  {
    id: 'family-with-kids',
    name: 'Family with kids',
    description: 'Urban apartment household with school-going children and car commute.',
    profile: {
      householdSize: 4,
      children: true,
      elderly: false,
      sensitiveGroup: true,
      homeType: 'apartment',
      commuteMode: 'car_ac',
      cookingFuel: 'lpg_induction',
      heatingMethod: 'electric_heater',
      hasAirPurifier: false,
      budget: 'flexible',
    },
  },
  {
    id: 'elderly-at-home',
    name: 'Elderly at home',
    description: 'Independent house with senior citizens spending most time indoors.',
    profile: {
      householdSize: 2,
      children: false,
      elderly: true,
      sensitiveGroup: true,
      homeType: 'independent',
      commuteMode: 'wfh',
      cookingFuel: 'lpg_induction',
      heatingMethod: 'electric_heater',
      hasAirPurifier: true,
      budget: 'low',
    },
  },
  {
    id: 'daily-commuter',
    name: 'Daily commuter',
    description: 'Single professional navigating heavy traffic daily on a two-wheeler.',
    profile: {
      householdSize: 1,
      children: false,
      elderly: false,
      sensitiveGroup: false,
      homeType: 'apartment',
      commuteMode: 'two_wheeler',
      cookingFuel: 'lpg_induction',
      heatingMethod: 'none',
      hasAirPurifier: false,
      budget: 'low',
    },
  },
  {
    id: 'hostel-student',
    name: 'Hostel student',
    description: 'College student living in a campus hostel walking or cycling daily.',
    profile: {
      householdSize: 1,
      children: false,
      elderly: false,
      sensitiveGroup: false,
      homeType: 'hostel',
      commuteMode: 'walk_cycle',
      cookingFuel: 'electric',
      heatingMethod: 'none',
      hasAirPurifier: false,
      budget: 'free',
    },
  },
] as const;

/**
 * Retrieves a preset profile by its unique identifier.
 * @param id - Preset identifier (e.g. 'family-with-kids').
 */
export function getPresetById(id: string): ProfilePreset | undefined {
  return PROFILE_PRESETS.find((preset) => preset.id === id);
}
