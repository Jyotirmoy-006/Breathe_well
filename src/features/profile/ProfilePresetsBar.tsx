/**
 * @file ProfilePresetsBar.tsx
 * @description Rapid 1-click household profile presets for under 45-second onboarding.
 */

import React from 'react';

import { PROFILE_PRESETS } from '../../domain/profile/presets';
import type { ProfilePreset } from '../../domain/profile/types';

interface PresetsBarProps {
  readonly onSelectPreset: (preset: ProfilePreset) => void;
  readonly activePresetId?: string | undefined;
  readonly className?: string | undefined;
}

const PRESET_ICONS: Record<string, string> = {
  'family-with-kids': '👨‍👩‍👧‍👦',
  'elderly-at-home': '👴',
  'daily-commuter': '🛵',
  'hostel-student': '🎒',
};

/**
 * 1-click preset bar for rapid demographic configuration.
 */
export function ProfilePresetsBar({
  onSelectPreset,
  activePresetId,
  className = '',
}: PresetsBarProps): React.JSX.Element {
  return (
    <div className={`space-y-2 ${className}`}>
      <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 block">
        Quick Presets (1-click setup):
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {PROFILE_PRESETS.map((preset) => {
          const isSelected = activePresetId === preset.id;
          const icon = PRESET_ICONS[preset.id] ?? '👤';

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onSelectPreset(preset);
              }}
              className={`min-h-[44px] p-2.5 text-left rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5341] ${
                isSelected
                  ? 'border-[#1A5341] bg-[#1A5341]/10 text-stone-900 dark:border-[#2DD4BF] dark:bg-[#2DD4BF]/20 dark:text-stone-100 shadow-xs'
                  : 'border-stone-300 bg-white/70 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900/70 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                <span aria-hidden="true">{icon}</span>
                <span>{preset.name}</span>
              </div>
              <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
