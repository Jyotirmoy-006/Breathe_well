/**
 * @file index.ts
 * @description Central export point for profile types, presets, and validation logic.
 */

export type {
  HomeType,
  CommuteMode,
  CookingFuel,
  HeatingMethod,
  BudgetTier,
  UserProfile,
  ProfilePreset,
} from './types';

export { PROFILE_PRESETS, getPresetById } from './presets';

export { profileSchema, validateProfile } from './validation';
