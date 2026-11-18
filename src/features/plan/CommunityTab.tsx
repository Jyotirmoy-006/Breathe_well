/**
 * @file CommunityTab.tsx
 * @description Tab 4: Collective neighborhood and institutional air quality playbooks.
 */

import React from 'react';

import type { PlanCategoryGroup } from '../../domain/planner/types';

import { ActionItemCard } from './ActionItemCard';
import type { PlanLocale } from './types';

interface CommunityTabProps {
  readonly group: PlanCategoryGroup;
  readonly selectedActionIds: ReadonlySet<string>;
  readonly onToggleAction: (actionId: string) => void;
  readonly locale: PlanLocale;
}

/**
 * Tab 4 organizing collective advocacy and community defense measures.
 */
export function CommunityTab({
  group,
  selectedActionIds,
  onToggleAction,
  locale,
}: CommunityTabProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
        Institutional initiatives and shared community agreements for apartment RWAs, schools, and
        offices.
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
