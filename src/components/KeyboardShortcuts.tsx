/**
 * @file KeyboardShortcuts.tsx
 * @description Global keyboard shortcuts overlay and listener for SaafSaans.
 */

'use client';

import React, { useEffect, useState } from 'react';

import { useTheme } from './theme/ThemeContext';
import { KeyboardShortcutHint, ModalDrawer } from './ui';

export interface ShortcutItem {
  readonly key: string;
  readonly label: string;
  readonly description: string;
}

export const SHORTCUT_ITEMS: readonly ShortcutItem[] = [
  { key: 'T', label: 'Toggle theme', description: 'Switch between Paper and Night mode' },
  { key: '/', label: 'Search location', description: 'Focus city & locality search box' },
  { key: '?', label: 'Shortcuts menu', description: 'Open this keyboard shortcuts dialog' },
  { key: 'Esc', label: 'Close modal', description: 'Dismiss open dialogs or drawers' },
  { key: '← / →', label: 'Timeline scrubber', description: 'Inspect hourly forecast timeline' },
];

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

/**
 * Global keyboard shortcuts listener and modal dialog.
 */
export function KeyboardShortcuts(): React.JSX.Element {
  const { toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.key === 't' || event.key === 'T') {
        event.preventDefault();
        toggleTheme();
      } else if (event.key === '/') {
        event.preventDefault();
        const searchInput = document.getElementById('location-search-input');
        searchInput?.focus();
      } else if (event.key === '?') {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleTheme]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
        }}
        aria-label="Open keyboard shortcuts"
        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-200 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5341]"
      >
        <span aria-hidden="true">⌨️</span>
        <span className="hidden sm:inline">Shortcuts</span>
        <KeyboardShortcutHint shortcut="?" />
      </button>

      <ModalDrawer
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        title="Keyboard Shortcuts"
        description="Navigate SaafSaans rapidly using accessible key commands."
        mode="modal"
      >
        <div className="space-y-3 py-2">
          {SHORTCUT_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border border-stone-200 bg-white/50 p-2.5 dark:border-stone-800 dark:bg-stone-900/50"
            >
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-stone-600 dark:text-stone-400">{item.description}</p>
              </div>
              <KeyboardShortcutHint shortcut={item.key} />
            </div>
          ))}
        </div>
      </ModalDrawer>
    </>
  );
}
