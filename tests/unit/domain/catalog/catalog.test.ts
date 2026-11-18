/**
 * @file catalog.test.ts
 * @description Unit tests validating every catalog action against strict schema, integrity, and uniqueness.
 */

import { describe, expect, it } from 'vitest';

import {
  ACTION_CATALOG,
  actionCatalogEntrySchema,
  getActionById,
  getActionsByCategory,
  getAllActions,
} from '@/domain/catalog';
import type { ActionCategory } from '@/domain/catalog';

describe('Action Catalog Integrity', () => {
  it('contains at least 25 vetted actions', () => {
    expect(ACTION_CATALOG.length).toBeGreaterThanOrEqual(25);
  });

  it('validates every action against actionCatalogEntrySchema with zero errors', () => {
    for (const action of ACTION_CATALOG) {
      const result = actionCatalogEntrySchema.safeParse(action);
      if (!result.success) {
        throw new Error(
          `Action validation failed for ${action.id}: ${JSON.stringify(result.error.issues)}`,
        );
      }
      expect(result.success).toBe(true);
    }
  });

  it('ensures all action IDs are unique and strictly kebab-case', () => {
    const ids = new Set<string>();
    const kebabRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

    for (const action of ACTION_CATALOG) {
      expect(kebabRegex.test(action.id)).toBe(true);
      expect(ids.has(action.id)).toBe(false);
      ids.add(action.id);
    }
    expect(ids.size).toBe(ACTION_CATALOG.length);
  });

  it('verifies valid coefficient ranges and no inverted numbers', () => {
    for (const action of ACTION_CATALOG) {
      const pm25 = action.coefficients.pm25ExposureReductionPct;
      expect(pm25.low).toBeGreaterThanOrEqual(0);
      expect(pm25.high).toBeLessThanOrEqual(100);
      expect(pm25.low).toBeLessThanOrEqual(pm25.high);

      const co2e = action.coefficients.co2eKgPerWeek;
      expect(co2e.low).toBeGreaterThanOrEqual(0);
      expect(co2e.low).toBeLessThanOrEqual(co2e.high);

      expect(action.evidenceNotes.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('covers all 4 action categories with multiple entries', () => {
    const categories: readonly ActionCategory[] = ['routine', 'home', 'swap', 'community'];
    for (const cat of categories) {
      const actions = getActionsByCategory(cat);
      expect(actions.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('retrieves actions by ID and handles missing IDs correctly', () => {
    const action = getActionById('routine-n95-commute');
    expect(action).toBeDefined();
    expect(action?.title).toContain('N95');

    const missing = getActionById('non-existent-action');
    expect(missing).toBeUndefined();
  });

  it('getAllActions returns complete catalog', () => {
    expect(getAllActions()).toHaveLength(ACTION_CATALOG.length);
  });
});
