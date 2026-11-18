/**
 * @file types.ts
 * @description Types for action plans, multi-language localization, and tab navigation.
 */

import type { ActionPlan, PlanActionItem } from '../../domain/planner/types';

export type PlanLocale = 'en' | 'hi' | 'bn';
export type PlanTabId = 'routine' | 'home' | 'swaps' | 'community';

export interface PlanSectionProps {
  readonly plan: ActionPlan;
  readonly activeLocale: PlanLocale;
  readonly onLocaleChange: (loc: PlanLocale) => void;
  readonly selectedActionIds: ReadonlySet<string>;
  readonly onToggleAction: (actionId: string) => void;
  readonly isAiGenerated?: boolean | undefined;
  readonly className?: string | undefined;
}

export interface ActionCardProps {
  readonly item: PlanActionItem;
  readonly isSelected: boolean;
  readonly onToggle: (actionId: string) => void;
  readonly locale: PlanLocale;
  readonly className?: string | undefined;
}
