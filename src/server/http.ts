/**
 * @file http.ts
 * @description Typed HTTP client wrapper with timeout support and structured error handling.
 */

import { logger } from './logger';

/** Default request timeout in milliseconds. */
export const DEFAULT_HTTP_TIMEOUT_MS = 10_000 as const;

/** Custom error representing HTTP request failures. */
export class HttpError extends Error {
  /**
   * HTTP status code returned by the server, if available.
   */
  readonly status: number;

  /**
   * Constructs an HttpError.
   * @param message - Error description.
   * @param status - HTTP response status code.
   */
  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

/** Options for typed HTTP fetch requests. */
export interface FetchOptions extends RequestInit {
  /** Timeout in milliseconds before aborting the request. */
  timeoutMs?: number;
}

/**
 * Performs a typed fetch request with timeout and error handling.
 *
 * @typeParam T - Expected response JSON payload shape.
 * @param url - Resource URL to fetch.
 * @param options - Request options including timeout.
 * @returns Parsed JSON response.
 * @throws HttpError on non-2xx status or fetch failure.
 */
export async function httpGet<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const timeout = options.timeoutMs ?? DEFAULT_HTTP_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorMsg = `HTTP request failed: ${String(response.status)} ${response.statusText}`;
      logger.warn(errorMsg, { url, status: response.status });
      throw new HttpError(errorMsg, response.status);
    }

    const data: unknown = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown fetch error';
    logger.error('HTTP request failed unexpectedly', { url, message });
    throw new HttpError(message, 500);
  } finally {
    clearTimeout(timer);
  }
}
