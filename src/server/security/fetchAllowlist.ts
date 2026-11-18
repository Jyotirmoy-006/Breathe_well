/**
 * @file fetchAllowlist.ts
 * @description Outbound fetch wrapper enforcing strict hostname allowlisting, timeouts, and payload limits.
 * Prevents SSRF attacks, outbound abuse, and unbounded memory consumption.
 */

import { logger } from '../logger';

/** Default outbound request timeout: 8 seconds. */
export const DEFAULT_FETCH_TIMEOUT_MS = 8_000 as const;

/** Maximum response payload size: 1 MB. */
export const MAX_RESPONSE_PAYLOAD_BYTES = 1_048_576 as const;

/** Permitted error categorization codes for allowlist operations. */
export type FetchAllowlistErrorCode =
  'DOMAIN_NOT_ALLOWED' | 'TIMEOUT' | 'RESPONSE_TOO_LARGE' | 'INVALID_URL' | 'HTTP_ERROR';

/** Custom typed error representing allowlist and safety assertion failures. */
export class FetchAllowlistError extends Error {
  readonly code: FetchAllowlistErrorCode;
  readonly status?: number | undefined;

  constructor(message: string, code: FetchAllowlistErrorCode, status?: number) {
    super(message);
    this.name = 'FetchAllowlistError';
    this.code = code;
    this.status = status;
  }
}

function matchesDomain(hostname: string): boolean {
  if (hostname === 'generativelanguage.googleapis.com') {
    return true;
  }
  if (hostname === 'open-meteo.com' || hostname.endsWith('.open-meteo.com')) {
    return true;
  }
  return false;
}

/**
 * Validates whether a raw URL targets an authorized external service.
 *
 * @param rawUrl - Target URL string.
 * @returns True if URL protocol and hostname pass the allowlist.
 */
export function isAllowedUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    if (parsed.username || parsed.password) {
      return false;
    }
    return matchesDomain(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

/** Optional parameters for allowlisted fetch calls. */
export interface FetchAllowlistOptions {
  readonly timeoutMs?: number;
  readonly maxBytes?: number;
}

function checkContentLength(response: Response, maxBytes: number): void {
  const lengthHeader = response.headers.get('content-length');
  if (lengthHeader) {
    const parsed = parseInt(lengthHeader, 10);
    if (!Number.isNaN(parsed) && parsed > maxBytes) {
      throw new FetchAllowlistError(
        `Response content-length ${String(parsed)} exceeds ${String(maxBytes)} byte cap.`,
        'RESPONSE_TOO_LARGE',
        response.status,
      );
    }
  }
}

async function verifyPayloadSize(response: Response, maxBytes: number): Promise<string> {
  const text = await response.text();
  const byteLength = new TextEncoder().encode(text).length;
  if (byteLength > maxBytes) {
    throw new FetchAllowlistError(
      `Response body size ${String(byteLength)} exceeds ${String(maxBytes)} byte cap.`,
      'RESPONSE_TOO_LARGE',
      response.status,
    );
  }
  return text;
}

/**
 * Executes an outbound fetch ensuring domain allowlisting, timeout, and response size constraints.
 *
 * @param url - Destination URL string.
 * @param init - Standard RequestInit options.
 * @param options - Custom timeout and size cap overrides.
 * @returns Resolved HTTP Response.
 * @throws FetchAllowlistError on security or network constraint violations.
 */
export async function fetchWithAllowlist(
  url: string,
  init?: RequestInit,
  options?: FetchAllowlistOptions,
): Promise<Response> {
  if (!isAllowedUrl(url)) {
    throw new FetchAllowlistError(`URL host is not authorized: ${url}`, 'DOMAIN_NOT_ALLOWED');
  }

  const timeoutMs = options?.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new FetchAllowlistError(
        `Request exceeded timeout limit of ${String(timeoutMs)} ms.`,
        'TIMEOUT',
      );
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Performs an allowlisted fetch and parses JSON with strict size constraints.
 *
 * @typeParam T - Expected parsed JSON type.
 * @param url - Destination URL string.
 * @param init - Request options.
 * @param options - Custom timeout and payload size overrides.
 * @returns Parsed JSON body.
 */
export async function fetchJsonWithAllowlist<T>(
  url: string,
  init?: RequestInit,
  options?: FetchAllowlistOptions,
): Promise<T> {
  const maxBytes = options?.maxBytes ?? MAX_RESPONSE_PAYLOAD_BYTES;
  const response = await fetchWithAllowlist(url, init, options);

  if (!response.ok) {
    logger.warn('Allowlisted fetch returned non-2xx status', { url, status: response.status });
    throw new FetchAllowlistError(
      `Outbound request failed with HTTP status ${String(response.status)}`,
      'HTTP_ERROR',
      response.status,
    );
  }

  checkContentLength(response, maxBytes);
  const rawText = await verifyPayloadSize(response, maxBytes);
  return JSON.parse(rawText) as T;
}
