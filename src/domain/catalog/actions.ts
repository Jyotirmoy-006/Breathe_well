/**
 * @file actions.ts
 * @description Master catalog aggregation and query accessor functions.
 */

import { COMMUNITY_ACTIONS } from './communityActions';
import { HOME_ACTIONS } from './homeActions';
import { ROUTINE_ACTIONS } from './routineActions';
import { SWAP_ACTIONS } from './swapActions';
import type { ActionCatalogEntry, ActionCategory } from './types';

/**
 * Complete immutable catalog of vetted air pollution mitigation and climate actions.
 */
export const ACTION_CATALOG: readonly ActionCatalogEntry[] = [
  ...ROUTINE_ACTIONS,
  ...HOME_ACTIONS,
  ...SWAP_ACTIONS,
  ...COMMUNITY_ACTIONS,
] as const;

/**
 * Returns all actions in the master catalog.
 */
export function getAllActions(): readonly ActionCatalogEntry[] {
  return ACTION_CATALOG;
}

/**
 * Finds an action by its unique kebab-case ID.
 * @param id - Action ID (e.g. 'routine-n95-commute').
 */
export function getActionById(id: string): ActionCatalogEntry | undefined {
  return ACTION_CATALOG.find((action) => action.id === id);
}

/**
 * Filters actions by their category.
 * @param category - The target ActionCategory.
 */
export function getActionsByCategory(category: ActionCategory): readonly ActionCatalogEntry[] {
  return ACTION_CATALOG.filter((action) => action.category === category);
}
