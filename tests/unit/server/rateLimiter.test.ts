/**
 * @file rateLimiter.test.ts
 * @description Unit tests for in-memory IP rate limiter and IP header extractor.
 */

import { describe, expect, it, beforeEach } from 'vitest';

import { createRateLimiter, getClientIp } from '@/server/security/rateLimiter';

describe('rateLimiter', () => {
  let limiter: ReturnType<typeof createRateLimiter>;

  beforeEach(() => {
    limiter = createRateLimiter({ windowMs: 1_000, maxRequests: 3 });
  });

  it('allows requests within the configured max limit', () => {
    const res1 = limiter.check('192.168.1.1');
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = limiter.check('192.168.1.1');
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = limiter.check('192.168.1.1');
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it('rejects requests once limit is exhausted within the window', () => {
    limiter.check('10.0.0.1');
    limiter.check('10.0.0.1');
    limiter.check('10.0.0.1');

    const blocked = limiter.check('10.0.0.1');
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetMs).toBeGreaterThan(0);
  });

  it('tracks distinct IP addresses independently', () => {
    limiter.check('1.1.1.1');
    limiter.check('1.1.1.1');
    limiter.check('1.1.1.1');

    const blockedIp1 = limiter.check('1.1.1.1');
    const allowedIp2 = limiter.check('2.2.2.2');

    expect(blockedIp1.allowed).toBe(false);
    expect(allowedIp2.allowed).toBe(true);
  });

  it('resets counters when manual reset is invoked', () => {
    limiter.check('192.168.1.1');
    limiter.check('192.168.1.1');
    limiter.check('192.168.1.1');
    expect(limiter.check('192.168.1.1').allowed).toBe(false);

    limiter.reset();
    const fresh = limiter.check('192.168.1.1');
    expect(fresh.allowed).toBe(true);
    expect(fresh.remaining).toBe(2);
  });
});

describe('getClientIp', () => {
  it('extracts primary client IP from x-forwarded-for header with proxies', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178',
    });
    expect(getClientIp(headers)).toBe('203.0.113.195');
  });

  it('extracts IP from x-real-ip when forwarded-for is absent', () => {
    const headers = new Headers({
      'x-real-ip': '198.51.100.22',
    });
    expect(getClientIp(headers)).toBe('198.51.100.22');
  });

  it('falls back to 127.0.0.1 when no IP headers are present', () => {
    const headers = new Headers();
    expect(getClientIp(headers)).toBe('127.0.0.1');
  });

  it('handles empty or whitespace-only header values gracefully', () => {
    const headers = new Headers({
      'x-forwarded-for': '   ',
      'x-real-ip': '',
    });
    expect(getClientIp(headers)).toBe('127.0.0.1');
  });
});
