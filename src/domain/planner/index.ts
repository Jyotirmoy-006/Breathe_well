/**
 * @file index.ts
 * @description Central export point for the deterministic planner engine and timeline window analyzer.
 */

export type {
  PlanActionItem,
  TimeBlockGroup,
  PlanCategoryGroup,
  ActionPlan,
  TimelineWindow,
  TimelineWindows,
} from './types';

export { generatePlan } from './engine';

export { analyzeTimelineWindows, getTimelinePointAt } from './bestWindow';
export type { TimelineForecastPoint } from './bestWindow';
