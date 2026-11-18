/**
 * @file SwapsTab.tsx
 * @description Tab 3: Sustainable lifestyle alternatives quantifying carbon and exposure savings.
 */

import React from 'react';

import type { PlanCategoryGroup } from '../../domain/planner/types';

import { ActionItemCard } from './ActionItemCard';
import type { PlanLocale } from './types';

interface SwapsTabProps {
  readonly group: PlanCategoryGroup;
  readonly selectedActionIds: ReadonlySet<string>;
  readonly onToggleAction: (actionId: string) => void;
  readonly locale: PlanLocale;
}

/**
 * Tab 3 displaying eco-friendly habit swaps that eliminate personal emissions.
 */
export function SwapsTab({
  group,
  selectedActionIds,
  onToggleAction,
  locale,
}: SwapsTabProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
        Substitutions that eliminate primary combustion sources and avert weekly greenhouse
        emissions.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {group.actions.map((item) => (
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
}
