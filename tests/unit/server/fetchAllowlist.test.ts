/**
 * @file fetchAllowlist.test.ts
 * @description Unit tests for outbound fetch allowlisting, SSRF protection, timeout, and size limits.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FetchAllowlistError,
  fetchJsonWithAllowlist,
  fetchWithAllowlist,
  isAllowedUrl,
} from '@/server/security/fetchAllowlist';

describe('isAllowedUrl', () => {
  it('permits authorized Open-Meteo domains and subdomains', () => {
    expect(isAllowedUrl('https://api.open-meteo.com/v1/forecast')).toBe(true);
    expect(isAllowedUrl('https://air-quality-api.open-meteo.com/v1/air-quality')).toBe(true);
    expect(isAllowedUrl('https://geocoding-api.open-meteo.com/v1/search')).toBe(true);
    expect(isAllowedUrl('https://open-meteo.com/en')).toBe(true);
  });

  it('permits Google Generative Language API endpoint', () => {
    expect(
      isAllowedUrl('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash'),
    ).toBe(true);
  });

  it('rejects unauthorized external hostnames', () => {
    expect(isAllowedUrl('https://example.com')).toBe(false);
    expect(isAllowedUrl('https://malicious-domain.org/data')).toBe(false);
    expect(isAllowedUrl('https://open-meteo.com.attacker.com')).toBe(false);
  });

  it('rejects internal and loopback IP addresses (SSRF defense)', () => {
    expect(isAllowedUrl('http://127.0.0.1:8080/admin')).toBe(false);
    expect(isAllowedUrl('http://169.254.169.254/latest/meta-data')).toBe(false);
    expect(isAllowedUrl('http://localhost:3000')).toBe(false);
  });

  it('rejects URLs with embedded user credentials', () => {
    expect(isAllowedUrl('https://admin:secret@api.open-meteo.com')).toBe(false);
  });

  it('rejects malformed or non-http protocols', () => {
    expect(isAllowedUrl('ftp://api.open-meteo.com')).toBe(false);
    expect(isAllowedUrl('javascript:alert(1)')).toBe(false);
    expect(isAllowedUrl('not-a-valid-url')).toBe(false);
  });
});

describe('fetchWithAllowlist', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('throws DOMAIN_NOT_ALLOWED before network dispatch for forbidden hosts', async () => {
    await expect(fetchWithAllowlist('https://forbidden-site.net/data')).rejects.toThrow(
      FetchAllowlistError,
    );

    try {
      await fetchWithAllowlist('https://forbidden-site.net/data');
    } catch (err: unknown) {
      if (err instanceof FetchAllowlistError) {
        expect(err.code).toBe('DOMAIN_NOT_ALLOWED');
      }
    }
  });

  it('aborts and throws TIMEOUT when network response exceeds timeout threshold', async () => {
    globalThis.fetch = vi.fn().mockImplementation((_url, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const abortError = new Error('The operation was aborted');
          abortError.name = 'AbortError';
          reject(abortError);
        });
      });
    });

    await expect(
      fetchWithAllowlist('https://api.open-meteo.com/v1/forecast', undefined, { timeoutMs: 50 }),
    ).rejects.toThrow(FetchAllowlistError);

    try {
      await fetchWithAllowlist('https://api.open-meteo.com/v1/forecast', undefined, {
        timeoutMs: 50,
      });
    } catch (err: unknown) {
      if (err instanceof FetchAllowlistError) {
        expect(err.code).toBe('TIMEOUT');
      }
    }
  });
});

describe('fetchJsonWithAllowlist', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns parsed JSON when response is ok and within size limit', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok', data: 42 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const data = await fetchJsonWithAllowlist<{ status: string; data: number }>(
      'https://api.open-meteo.com/v1/forecast',
    );
    expect(data.status).toBe('ok');
    expect(data.data).toBe(42);
  });

  it('throws HTTP_ERROR when remote server returns non-2xx status', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('Bad Gateway', { status: 502 }));

    await expect(fetchJsonWithAllowlist('https://api.open-meteo.com/v1/forecast')).rejects.toThrow(
      FetchAllowlistError,
    );
  });

  it('throws RESPONSE_TOO_LARGE when content-length header exceeds cap', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response('{}', {
        status: 200,
        headers: { 'content-length': '2000000' },
      }),
    );

    await expect(
      fetchJsonWithAllowlist('https://api.open-meteo.com/v1/forecast', undefined, {
        maxBytes: 1000,
      }),
    ).rejects.toThrow(FetchAllowlistError);
  });

  it('throws RESPONSE_TOO_LARGE when response body byte count exceeds cap', async () => {
    const largeBody = JSON.stringify({ payload: 'x'.repeat(2000) });
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(largeBody, { status: 200 }));

    await expect(
      fetchJsonWithAllowlist('https://api.open-meteo.com/v1/forecast', undefined, {
        maxBytes: 500,
      }),
    ).rejects.toThrow(FetchAllowlistError);
  });
});
