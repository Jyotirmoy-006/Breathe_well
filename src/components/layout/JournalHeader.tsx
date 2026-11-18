/**
 * @file JournalHeader.tsx
 * @description Accessible header containing branding, location search, theme toggle, and shortcuts.
 */

'use client';

import React from 'react';

import { LocationCombobox } from '../../features/location';
import type { LocationItem } from '../../features/location';
import { KeyboardShortcuts } from '../KeyboardShortcuts';
import { useTheme } from '../theme/ThemeContext';
import { KeyboardShortcutHint } from '../ui/KeyboardShortcutHint';

interface JournalHeaderProps {
  readonly selectedLocation: LocationItem;
  readonly onSelectLocation: (loc: LocationItem) => void;
  readonly className?: string | undefined;
}

/**
 * Editorial journal masthead providing quick search and theme controls.
 */
export function JournalHeader({
  selectedLocation,
  onSelectLocation,
  className = '',
}: JournalHeaderProps): React.JSX.Element {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className={`border-b border-stone-300 dark:border-stone-800 bg-[#FAF6EE]/80 dark:bg-[#1A1D23]/80 backdrop-blur-md sticky top-0 z-30 ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Masthead Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-stone-900 dark:text-stone-100">
            SaafSaans{' '}
            <span className="font-normal text-stone-600 dark:text-stone-400 font-sans text-base sm:text-lg">
              (साफ़ साँस)
            </span>
          </h1>
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#1A5341] dark:text-[#2DD4BF]">
            Atmosphere Journal & Smog Defense Protocol
          </p>
        </div>

        {/* Location Search Combobox */}
        <div className="w-full sm:w-auto flex-1 max-w-sm">
          <LocationCombobox
            selectedLocation={selectedLocation}
            onSelectLocation={onSelectLocation}
          />
        </div>

        {/* Controls: Theme & Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'paper' ? 'Night' : 'Paper'} theme (Press T)`}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white/70 px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800/70 dark:text-stone-200 dark:hover:bg-stone-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5341]"
          >
            <span aria-hidden="true">{theme === 'paper' ? '🌙' : '☀️'}</span>
            <span className="hidden md:inline">{theme === 'paper' ? 'Night' : 'Paper'}</span>
            <KeyboardShortcutHint shortcut="T" />
          </button>

          <KeyboardShortcuts />
        </div>
      </div>
    </header>
  );
}
