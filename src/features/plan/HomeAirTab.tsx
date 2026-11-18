/**
 * @file HomeAirTab.tsx
 * @description Tab 2: Ranked indoor air quality measures by exposure reduction, effort, and cost.
 */

import React from 'react';

import type { PlanCategoryGroup } from '../../domain/planner/types';

import { ActionItemCard } from './ActionItemCard';
import type { PlanLocale } from './types';

interface HomeAirTabProps {
  readonly group: PlanCategoryGroup;
  readonly selectedActionIds: ReadonlySet<string>;
  readonly onToggleAction: (actionId: string) => void;
  readonly locale: PlanLocale;
}

/**
 * Tab 2 presenting ranked indoor air filtration and physical sealing interventions.
 */
export function HomeAirTab({
  group,
  selectedActionIds,
  onToggleAction,
  locale,
}: HomeAirTabProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
        Ranked domestic interventions to suppress indoor infiltration of PM2.5 particles.
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
