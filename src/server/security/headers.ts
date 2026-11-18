/**
 * @file headers.ts
 * @description Hardened HTTP security headers configuration and application utilities.
 * Enforces strict Content Security Policy, HSTS, frame protection, and origin isolation.
 */

/** Key-value representation of standard HTTP security headers. */
export interface SecurityHeaderEntry {
  readonly key: string;
  readonly value: string;
}

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.open-meteo.com https://generativelanguage.googleapis.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

/** Canonical list of security headers for Next.js responses. */
export const SECURITY_HEADERS: readonly SecurityHeaderEntry[] = [
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(), microphone=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

/** Map representation of security headers for direct dictionary lookups. */
export const SECURITY_HEADERS_MAP: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(SECURITY_HEADERS.map((entry) => [entry.key, entry.value])),
);

/**
 * Applies security headers directly onto a web standard Headers instance.
 *
 * @param headers - Target Headers instance to mutate with security headers.
 */
export function applySecurityHeaders(headers: Headers): void {
  for (const entry of SECURITY_HEADERS) {
    headers.set(entry.key, entry.value);
  }
}
