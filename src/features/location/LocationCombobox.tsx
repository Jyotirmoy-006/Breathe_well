/**
 * @file LocationCombobox.tsx
 * @description Accessible combobox for searching and selecting cities and localities.
 */

'use client';

import React, { useRef, useState } from 'react';

import { KeyboardShortcutHint } from '../../components/ui';

import { GeolocationButton } from './GeolocationButton';
import type { LocationComboboxProps, LocationItem } from './types';
import { useGeocodeSearch } from './useGeocodeSearch';

interface NavigationContext {
  readonly results: readonly LocationItem[];
  readonly highlightedIndex: number;
  readonly setHighlightedIndex: (idx: (prev: number) => number) => void;
  readonly onSelect: (item: LocationItem) => void;
  readonly onClose: () => void;
}

function handleKeyDownNavigation(event: React.KeyboardEvent, ctx: NavigationContext): void {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    ctx.setHighlightedIndex((prev) => (prev + 1 < ctx.results.length ? prev + 1 : 0));
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    ctx.setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : ctx.results.length - 1));
  } else if (event.key === 'Enter') {
    const selected = ctx.results[ctx.highlightedIndex];
    if (selected) {
      event.preventDefault();
      ctx.onSelect(selected);
    }
  } else if (event.key === 'Escape') {
    event.preventDefault();
    ctx.onClose();
  }
}

/**
 * Search combobox allowing keyboard-driven location exploration.
 */
export function LocationCombobox({
  selectedLocation,
  onSelectLocation,
  className = '',
}: LocationComboboxProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const { query, setQuery, results, isLoading, clearResults } = useGeocodeSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (item: LocationItem): void => {
    onSelectLocation(item);
    setQuery('');
    clearResults();
    setIsOpen(false);
  };

  const handleBlur = (e: React.FocusEvent): void => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative flex items-center gap-2 ${className}`} onBlur={handleBlur}>
      <div className="relative flex-1">
        <input
          id="location-search-input"
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen && results.length > 0}
          aria-controls="location-results-list"
          aria-autocomplete="list"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={(e) => {
            handleKeyDownNavigation(e, {
              results,
              highlightedIndex,
              setHighlightedIndex,
              onSelect: handleSelect,
              onClose: () => {
                setIsOpen(false);
              },
            });
          }}
          placeholder={`Search city or locality (current: ${selectedLocation.name})`}
          className="w-full min-h-[44px] rounded-lg border border-stone-300 bg-white/80 px-3.5 pr-14 text-sm text-stone-900 placeholder:text-stone-500 shadow-xs backdrop-blur-xs transition-colors focus:border-[#1A5341] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5341]/20 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-100 dark:placeholder:text-stone-400 dark:focus:border-[#2DD4BF]"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
          {isLoading ? (
            <span className="text-xs text-stone-400 animate-spin">⏳</span>
          ) : (
            <KeyboardShortcutHint shortcut="/" />
          )}
        </div>

        {isOpen && results.length > 0 && (
          <ul
            id="location-results-list"
            role="listbox"
            aria-label="Location suggestions"
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-stone-300 bg-white shadow-xl dark:border-stone-700 dark:bg-stone-900"
          >
            {results.map((loc, idx) => (
              <li
                key={loc.id}
                role="option"
                aria-selected={idx === highlightedIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(loc);
                }}
                onMouseEnter={() => {
                  setHighlightedIndex(idx);
                }}
                className={`min-h-[44px] px-3.5 py-2.5 text-xs sm:text-sm cursor-pointer flex flex-col justify-center ${
                  idx === highlightedIndex
                    ? 'bg-[#1A5341]/10 text-[#1A5341] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF]'
                    : 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <span className="font-semibold">{loc.name}</span>
                <span className="text-[11px] text-stone-600 dark:text-stone-400">
                  {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <GeolocationButton onLocationDetected={onSelectLocation} />
    </div>
  );
}
