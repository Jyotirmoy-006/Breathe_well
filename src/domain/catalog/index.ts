/**
 * @file index.ts
 * @description Central export point for the air mitigation action catalog and types.
 */

export type {
  ActionCategory,
  ActionEffort,
  ActionCost,
  ActionTimeBlock,
  ActionConfidence,
  ActionEligibilityRules,
  ActionCoefficients,
  ActionCatalogEntry,
} from './types';

export {
  actionCategorySchema,
  actionEffortSchema,
  actionCostSchema,
  actionTimeBlockSchema,
  actionConfidenceSchema,
  actionEligibilityRulesSchema,
  actionCoefficientsSchema,
  actionCatalogEntrySchema,
} from './types';

export { ACTION_CATALOG, getAllActions, getActionById, getActionsByCategory } from './actions';

export { ROUTINE_ACTIONS } from './routineActions';
export { HOME_ACTIONS } from './homeActions';
export { SWAP_ACTIONS } from './swapActions';
export { COMMUNITY_ACTIONS } from './communityActions';
