/**
 * @file RoutineTab.tsx
 * @description Tab 1: Time-blocked daily schedule for personal exposure mitigation.
 */

import React from 'react';

import type { TimeBlockGroup } from '../../domain/planner/types';

import { ActionItemCard } from './ActionItemCard';
import { PLAN_TRANSLATIONS } from './translations';
import type { PlanLocale } from './types';

interface RoutineTabProps {
  readonly timeBlocks: readonly TimeBlockGroup[];
  readonly selectedActionIds: ReadonlySet<string>;
  readonly onToggleAction: (actionId: string) => void;
  readonly locale: PlanLocale;
}

/**
 * Tab 1 displaying time-blocked sequence of actions across morning, commute, day, and night.
 */
export function RoutineTab({
  timeBlocks,
  selectedActionIds,
  onToggleAction,
  locale,
}: RoutineTabProps): React.JSX.Element {
  const strings = PLAN_TRANSLATIONS[locale];

  return (
    <div className="space-y-6">
      {timeBlocks.map((block) => {
        if (block.actions.length === 0) return null;
        const blockTitle = strings.timeBlocks[block.timeBlock] ?? block.timeBlock;

        return (
          <div key={block.timeBlock} className="space-y-3">
            <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-1.5">
              <span className="font-mono text-xs font-bold text-[#1A5341] dark:text-[#2DD4BF] uppercase">
                ⏱ {blockTitle}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {block.actions.map((item) => (
                <ActionItemCard
                  key={item.action.id}
                  item={item}
                  isSelected={selectedActionIds.has(item.action.id)}
                  onToggle={onToggleAction}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
