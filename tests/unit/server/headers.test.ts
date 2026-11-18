/**
 * @file headers.test.ts
 * @description Unit tests for HTTP security headers configuration and application.
 */

import { describe, expect, it } from 'vitest';

import {
  applySecurityHeaders,
  SECURITY_HEADERS,
  SECURITY_HEADERS_MAP,
} from '@/server/security/headers';

describe('security headers', () => {
  it('defines required security headers including CSP, HSTS, nosniff, and DENY', () => {
    expect(SECURITY_HEADERS.length).toBeGreaterThanOrEqual(6);
    expect(SECURITY_HEADERS_MAP['Content-Security-Policy']).toBeDefined();
    expect(SECURITY_HEADERS_MAP['Strict-Transport-Security']).toBeDefined();
    expect(SECURITY_HEADERS_MAP['X-Content-Type-Options']).toBe('nosniff');
    expect(SECURITY_HEADERS_MAP['X-Frame-Options']).toBe('DENY');
    expect(SECURITY_HEADERS_MAP['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(SECURITY_HEADERS_MAP['Permissions-Policy']).toContain('geolocation=(self)');
  });

  it('applies all security headers onto a Headers instance', () => {
    const headers = new Headers();
    applySecurityHeaders(headers);

    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('x-frame-options')).toBe('DENY');
    expect(headers.get('content-security-policy')).toContain("default-src 'self'");
    expect(headers.get('strict-transport-security')).toContain('max-age=');
  });
});
