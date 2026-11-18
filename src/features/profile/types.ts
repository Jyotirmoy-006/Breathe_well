/**
 * @file types.ts
 * @description Types for household demographic and dwelling profile builder.
 */

import type { UserProfile } from '../../domain/profile/types';

export interface ProfileSectionProps {
  readonly profile: UserProfile;
  readonly onProfileChange: (updated: UserProfile) => void;
  readonly activePresetId?: string | undefined;
  readonly className?: string | undefined;
}
