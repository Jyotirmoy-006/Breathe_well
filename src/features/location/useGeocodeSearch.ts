/**
 * @file useGeocodeSearch.ts
 * @description Custom hook for debounced (300ms) geocoding location searches.
 */

'use client';

import { useEffect, useState } from 'react';

import type { LocationItem } from './types';

interface UseGeocodeSearchResult {
  readonly query: string;
  readonly setQuery: (q: string) => void;
  readonly results: readonly LocationItem[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly clearResults: () => void;
}

const DEBOUNCE_DELAY_MS = 300;

interface ApiResponse {
  readonly locations?: readonly LocationItem[];
  readonly error?: string;
}

/**
 * Manages debounced location search queries and results against `/api/geocode`.
 */
export function useGeocodeSearch(): UseGeocodeSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<readonly LocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    const controller = new AbortController();

    const timer = setTimeout(() => {
      void fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`Search request failed with status ${String(res.status)}`);
          }
          return res.json() as Promise<ApiResponse>;
        })
        .then((data) => {
          setResults(data.locations ?? []);
          setIsLoading(false);
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) {
            return;
          }
          setError(err instanceof Error ? err.message : 'Failed to search locations');
          setIsLoading(false);
        });
    }, DEBOUNCE_DELAY_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const clearResults = (): void => {
    setResults([]);
    setError(null);
  };

  return { query, setQuery, results, isLoading, error, clearResults };
}
