/**
 * @file openMeteoGeocoding.ts
 * @description Provider for Open-Meteo Geocoding API.
 * Searches and validates coordinates for cities and localities.
 */

import { z } from 'zod';

import { err, ok } from '@/domain/result';
import type { Result } from '@/domain/result';
import { fetchJsonWithAllowlist } from '@/server/security/fetchAllowlist';
import { sanitizeQuery } from '@/server/security/sanitize';

const geocodingItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  admin1: z.string().optional(),
  country: z.string().optional(),
});

const geocodingResponseSchema = z.object({
  results: z.array(geocodingItemSchema).optional(),
});

/** Validated location match returned from geocoding. */
export interface GeocodingMatch {
  readonly id: number;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly admin1?: string | undefined;
  readonly country?: string | undefined;
}

const BASE_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search' as const;
const MAX_SEARCH_RESULTS_COUNT = 5 as const;

/**
 * Searches locations matching a query string using Open-Meteo Geocoding.
 *
 * @param query - Location name or search string.
 * @returns Result containing list of matched locations or error description.
 */
export async function searchLocations(
  query: string,
): Promise<Result<readonly GeocodingMatch[], string>> {
  const safeQuery = sanitizeQuery(query);
  if (safeQuery.length < 2) {
    return err('Query must contain at least 2 characters.');
  }

  const url = `${BASE_GEOCODING_URL}?name=${encodeURIComponent(safeQuery)}&count=${String(MAX_SEARCH_RESULTS_COUNT)}&language=en&format=json`;

  try {
    const rawData = await fetchJsonWithAllowlist<unknown>(url);
    const parsed = geocodingResponseSchema.safeParse(rawData);

    if (!parsed.success) {
      return err('Failed to parse geocoding response schema.');
    }

    const matches: GeocodingMatch[] = (parsed.data.results ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      admin1: item.admin1,
      country: item.country,
    }));

    return ok(matches);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Geocoding request failed.';
    return err(message);
  }
}
