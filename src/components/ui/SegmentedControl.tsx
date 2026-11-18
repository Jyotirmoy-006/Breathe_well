/**
 * @file SegmentedControl.tsx
 * @description Accessible segmented chip selector with ARIA radiogroup semantics.
 */

import React from 'react';

export interface SegmentOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly badge?: string;
}

export interface SegmentedControlProps<T extends string> {
  readonly name: string;
  readonly options: readonly SegmentOption<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly className?: string;
}

/**
 * Accessible segmented control rendered with radiogroup semantics.
 */
export function SegmentedControl<T extends string>({
  name,
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>): React.JSX.Element {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={`inline-flex flex-wrap gap-1 rounded-xl border border-stone-300 bg-stone-100 p-1 dark:border-stone-700 dark:bg-stone-900 ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => {
              onChange(option.value);
            }}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5341] dark:focus-visible:ring-[#2DD4BF] ${
              isSelected
                ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-100'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
            }`}
          >
            <span>{option.label}</span>
            {option.badge && (
              <span className="ml-1.5 rounded-full bg-stone-200 px-1.5 py-0.5 text-[10px] text-stone-700 dark:bg-stone-700 dark:text-stone-300">
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
