/**
 * @file types.ts
 * @description Type definitions for generated action plans and 48-hour timeline windows.
 */

import type { AqiCategory } from '../aqi/constants';
import type { ActionCatalogEntry, ActionTimeBlock } from '../catalog/types';
import type { CombinedImpact } from '../impact/types';
import type { Pm25UgM3 } from '../types';

/** A planned action enhanced with deterministic rationale and execution priority. */
export interface PlanActionItem {
  readonly action: ActionCatalogEntry;
  readonly rationale: string;
  readonly priority: number;
}

/** Time-blocked collection of actions for daily routine scheduling. */
export interface TimeBlockGroup {
  readonly timeBlock: ActionTimeBlock;
  readonly actions: readonly PlanActionItem[];
}

/** Category-specific collection of actions for home, swaps, or community. */
export interface PlanCategoryGroup {
  readonly actions: readonly PlanActionItem[];
}

/** Complete structured action plan ready for UI display across four tabs. */
export interface ActionPlan {
  readonly aqiCategory: AqiCategory;
  readonly currentPm25: Pm25UgM3;
  readonly routine: {
    readonly timeBlocks: readonly TimeBlockGroup[];
    readonly totalActions: number;
  };
  readonly homeAir: PlanCategoryGroup;
  readonly swaps: PlanCategoryGroup;
  readonly community: PlanCategoryGroup;
  readonly impact: CombinedImpact;
  readonly totalActionCount: number;
  readonly generatedAtIso: string;
}

/** Output of timeline window analysis for a contiguous period. */
export interface TimelineWindow {
  readonly startIndex: number;
  readonly endIndex: number;
  readonly startHour: string;
  readonly endHour: string;
  readonly averagePm25: Pm25UgM3;
  readonly recommendation: string;
}

/** Pair of optimal and hazardous activity windows identified in a timeline. */
export interface TimelineWindows {
  readonly bestWindow: TimelineWindow;
  readonly avoidWindow: TimelineWindow;
}
