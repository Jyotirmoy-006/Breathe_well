/**
 * @file Tabs.tsx
 * @description Accessible tablist and tab panels implementing WAI-ARIA Tabs design pattern.
 */

import React from 'react';

export interface TabItem<T extends string> {
  readonly id: T;
  readonly label: string;
  readonly count?: number;
  readonly icon?: React.ReactNode;
}

export interface TabsProps<T extends string> {
  readonly tabs: readonly TabItem<T>[];
  readonly activeTab: T;
  readonly onTabChange: (tabId: T) => void;
  readonly ariaLabel: string;
  readonly className?: string;
}

function handleTabKeyDown<T extends string>(
  event: React.KeyboardEvent,
  tabs: readonly TabItem<T>[],
  activeIndex: number,
  onTabChange: (tabId: T) => void,
): void {
  let nextIndex = -1;
  if (event.key === 'ArrowRight') {
    nextIndex = (activeIndex + 1) % tabs.length;
  } else if (event.key === 'ArrowLeft') {
    nextIndex = (activeIndex - 1 + tabs.length) % tabs.length;
  } else if (event.key === 'Home') {
    nextIndex = 0;
  } else if (event.key === 'End') {
    nextIndex = tabs.length - 1;
  }

  const nextTab = tabs[nextIndex];
  if (nextIndex >= 0 && nextTab !== undefined) {
    event.preventDefault();
    onTabChange(nextTab.id);
  }
}

/**
 * Tablist component supporting full keyboard navigation across tab controls.
 */
export function Tabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel,
  className = '',
}: TabsProps<T>): React.JSX.Element {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex flex-wrap border-b border-stone-300 dark:border-stone-700 gap-1 sm:gap-2 ${className}`}
    >
      {tabs.map((tab, idx) => {
        const isSelected = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => {
              onTabChange(tab.id);
            }}
            onKeyDown={(e) => {
              handleTabKeyDown(e, tabs, idx, onTabChange);
            }}
            className={`min-h-[44px] px-3 sm:px-4 py-2 border-b-2 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5341] dark:focus-visible:ring-[#2DD4BF] ${
              isSelected
                ? 'border-[#1A5341] text-[#1A5341] dark:border-[#2DD4BF] dark:text-[#2DD4BF]'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="rounded-full bg-stone-200 px-1.5 py-0.5 text-[10px] text-stone-700 dark:bg-stone-700 dark:text-stone-300">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
