/**
 * @file types.ts
 * @description Types and domain model for user household and lifestyle profiles.
 */

/** Type of dwelling residence. */
export type HomeType = 'apartment' | 'independent' | 'hostel';

/** Primary daily commute mode. */
export type CommuteMode = 'metro_bus' | 'walk_cycle' | 'two_wheeler' | 'car_ac' | 'wfh';

/** Primary cooking fuel source used in the household. */
export type CookingFuel = 'lpg_induction' | 'biomass_coal' | 'electric';

/** Primary winter space heating method used in the household. */
export type HeatingMethod = 'electric_heater' | 'wood_angithi' | 'none';

/** Financial flexibility for air pollution mitigation measures. */
export type BudgetTier = 'free' | 'low' | 'flexible';

/**
 * User profile capturing household composition, dwelling attributes, and daily habits.
 */
export interface UserProfile {
  /** Total number of residents in the home (1 to 20). */
  readonly householdSize: number;
  /** Presence of children aged <= 12 years. */
  readonly children: boolean;
  /** Presence of elderly adults aged >= 60 years. */
  readonly elderly: boolean;
  /** Presence of individuals with pre-existing respiratory or cardiac conditions. */
  readonly sensitiveGroup: boolean;
  /** Housing architecture type. */
  readonly homeType: HomeType;
  /** Commute transit pattern. */
  readonly commuteMode: CommuteMode;
  /** Household cooking fuel. */
  readonly cookingFuel: CookingFuel;
  /** Winter space heating source. */
  readonly heatingMethod: HeatingMethod;
  /** Whether the household currently owns and runs a HEPA air purifier. */
  readonly hasAirPurifier: boolean;
  /** Target financial budget tier for recommended actions. */
  readonly budget: BudgetTier;
}

/** Preset profile descriptor with human-readable label and metadata. */
export interface ProfilePreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly profile: UserProfile;
}
