/**
 * @file PlanLanguageSelector.tsx
 * @description Accessible segmented language selector supporting English, Hindi, and Bengali.
 */

import React from 'react';

import type { PlanLocale } from './types';

interface LanguageSelectorProps {
  readonly activeLocale: PlanLocale;
  readonly onChangeLocale: (locale: PlanLocale) => void;
  readonly className?: string | undefined;
}

const LANGUAGES: readonly {
  readonly id: PlanLocale;
  readonly label: string;
  readonly native: string;
}[] = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'bn', label: 'Bengali', native: 'বাংলা' },
];

/**
 * Segmented control enabling instant switching of plan language representation.
 */
export function PlanLanguageSelector({
  activeLocale,
  onChangeLocale,
  className = '',
}: LanguageSelectorProps): React.JSX.Element {
  return (
    <div
      role="radiogroup"
      aria-label="Select plan language"
      className={`inline-flex items-center gap-1 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 p-1 ${className}`}
    >
      {LANGUAGES.map((lang) => {
        const isSelected = activeLocale === lang.id;
        return (
          <button
            key={lang.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => {
              onChangeLocale(lang.id);
            }}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5341] ${
              isSelected
                ? 'bg-white text-stone-900 shadow-xs dark:bg-stone-800 dark:text-stone-100'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
            }`}
          >
            <span>{lang.native}</span>
          </button>
        );
      })}
    </div>
  );
}
