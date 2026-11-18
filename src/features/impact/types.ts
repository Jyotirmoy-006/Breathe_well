/**
 * @file types.ts
 * @description Types for What-If impact simulation, action toggles, and mathematical explanations.
 */

import type { ActionCatalogEntry } from '../../domain/catalog/types';
import type { CombinedImpact } from '../../domain/impact/types';

export interface ImpactSectionProps {
  readonly allActions: readonly ActionCatalogEntry[];
  readonly selectedActionIds: ReadonlySet<string>;
  readonly onToggleAction: (actionId: string) => void;
  readonly onSelectAll: () => void;
  readonly onDeselectAll: () => void;
  readonly className?: string | undefined;
}

export interface ExposureMeterProps {
  readonly impact: CombinedImpact;
  readonly onOpenExplanation: () => void;
  readonly className?: string | undefined;
}
