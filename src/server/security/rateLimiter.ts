/**
 * @file rateLimiter.ts
 * @description In-memory rate limiter per IP address with sliding/fixed window support.
 * Protects endpoints from abuse, resource exhaustion, and denial of service.
 */

/** Configuration options for a rate limiter instance. */
export interface RateLimiterOptions {
  /** Time window in milliseconds. */
  readonly windowMs: number;
  /** Maximum number of allowed requests per window. */
  readonly maxRequests: number;
}

/** Result returned after inspecting a rate limit. */
export interface RateLimitResult {
  /** Whether the request is permitted. */
  readonly allowed: boolean;
  /** Number of remaining allowed requests within current window. */
  readonly remaining: number;
  /** Milliseconds until the rate limit window resets. */
  readonly resetMs: number;
}

interface RateLimitRecord {
  count: number;
  resetTimeMs: number;
}

const DEFAULT_WINDOW_MS = 60_000 as const;
const DEFAULT_MAX_REQUESTS = 30 as const;
const MAX_ENTRIES_BEFORE_PRUNING = 5_000 as const;

class MemoryRateLimiter {
  private readonly records = new Map<string, RateLimitRecord>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(options?: Partial<RateLimiterOptions>) {
    this.windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
    this.maxRequests = options?.maxRequests ?? DEFAULT_MAX_REQUESTS;
  }

  private pruneExpired(now: number): void {
    if (this.records.size < MAX_ENTRIES_BEFORE_PRUNING) {
      return;
    }
    for (const [key, record] of this.records.entries()) {
      if (now > record.resetTimeMs) {
        this.records.delete(key);
      }
    }
  }

  public check(clientKey: string): RateLimitResult {
    const now = Date.now();
    this.pruneExpired(now);

    const existing = this.records.get(clientKey);

    if (!existing || now >= existing.resetTimeMs) {
      this.records.set(clientKey, { count: 1, resetTimeMs: now + this.windowMs });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetMs: this.windowMs,
      };
    }

    if (existing.count < this.maxRequests) {
      existing.count += 1;
      return {
        allowed: true,
        remaining: this.maxRequests - existing.count,
        resetMs: Math.max(0, existing.resetTimeMs - now),
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, existing.resetTimeMs - now),
    };
  }

  public reset(): void {
    this.records.clear();
  }
}

/** Pre-configured rate limiters for standard endpoints. */
export const geocodeRateLimiter = new MemoryRateLimiter({
  windowMs: 60_000,
  maxRequests: 30,
});

export const airQualityRateLimiter = new MemoryRateLimiter({
  windowMs: 60_000,
  maxRequests: 30,
});

export const planRateLimiter = new MemoryRateLimiter({
  windowMs: 60_000,
  maxRequests: 10,
});

export const chatRateLimiter = new MemoryRateLimiter({
  windowMs: 60_000,
  maxRequests: 20,
});

/**
 * Creates a dedicated rate limiter instance.
 *
 * @param options - Limiter window and capacity configuration.
 * @returns Rate limiter instance.
 */
export function createRateLimiter(options?: Partial<RateLimiterOptions>): {
  check: (clientKey: string) => RateLimitResult;
  reset: () => void;
} {
  const limiter = new MemoryRateLimiter(options);
  return {
    check: (key: string): RateLimitResult => limiter.check(key),
    reset: (): void => {
      limiter.reset();
    },
  };
}

/**
 * Extracts a client IP address from request headers with secure fallback.
 *
 * @param headers - HTTP Headers or Request object.
 * @returns Detected client IP string.
 */
export function getClientIp(headers: Headers | { get(name: string): string | null }): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp && firstIp.length > 0) {
      return firstIp;
    }
  }

  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp && realIp.length > 0) {
    return realIp;
  }

  return '127.0.0.1';
}
