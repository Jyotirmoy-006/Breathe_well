/**
 * @file types.ts
 * @description Types for household demographic and dwelling profile builder.
 */

import type { ProfilePreset, UserProfile } from '../../domain/profile/types';

export type { ProfilePreset, UserProfile };

export interface ProfileSectionProps {
  readonly profile: UserProfile;
  readonly onProfileChange: (updated: UserProfile) => void;
  readonly activePresetId?: string | undefined;
  readonly className?: string | undefined;
}
