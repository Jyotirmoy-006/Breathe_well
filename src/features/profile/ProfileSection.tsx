/**
 * @file ProfileSection.tsx
 * @description Numbered section 03 Your household offering 1-click presets and tailored custom settings.
 */

'use client';

import React, { useState } from 'react';

import { Button } from '../../components/ui/Button';

import { ProfileCustomForm } from './ProfileCustomForm';
import { ProfilePresetsBar } from './ProfilePresetsBar';
import { ProfileSummaryBadge } from './ProfileSummaryBadge';
import type { ProfileSectionProps } from './types';

/**
 * Section 03 Your household configuring family demographics and dwelling traits.
 */
export function ProfileSection({
  profile,
  onProfileChange,
  activePresetId,
  className = '',
}: ProfileSectionProps): React.JSX.Element {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <section aria-labelledby="section-your-household" className={`space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-300 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-[#1A5341] dark:text-[#2DD4BF] tracking-wider uppercase">
            03
          </span>
          <h2 id="section-your-household" className="text-xl sm:text-2xl font-bold font-serif">
            Your household
          </h2>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowCustom((prev) => !prev);
          }}
          aria-expanded={showCustom}
        >
          {showCustom ? 'Hide adjustments' : '✏️ Customize details'}
        </Button>
      </div>

      {/* 1-Click Fast Presets */}
      <ProfilePresetsBar
        onSelectPreset={(preset) => {
          onProfileChange(preset.profile);
        }}
        activePresetId={activePresetId}
      />

      {/* Live Updating Summary Badges */}
      <ProfileSummaryBadge profile={profile} />

      {/* Expandable Custom Form */}
      {showCustom && <ProfileCustomForm profile={profile} onChange={onProfileChange} />}
    </section>
  );
}
