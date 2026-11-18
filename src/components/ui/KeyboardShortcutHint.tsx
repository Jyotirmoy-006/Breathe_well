/**
 * @file KeyboardShortcutHint.tsx
 * @description Accessible keyboard shortcut badge indicator element.
 */

import React from 'react';

export interface KeyboardShortcutHintProps {
  readonly shortcut: string;
  readonly label?: string;
  readonly className?: string;
}

/**
 * Visual shortcut indicator badge for keyboard accessible features.
 */
export function KeyboardShortcutHint({
  shortcut,
  label,
  className = '',
}: KeyboardShortcutHintProps): React.JSX.Element {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-stone-600 dark:text-stone-400 ${className}`}
    >
      {label && <span>{label}</span>}
      <kbd className="inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded border border-stone-300 bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-stone-700 shadow-xs dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
        {shortcut}
      </kbd>
    </span>
  );
}
