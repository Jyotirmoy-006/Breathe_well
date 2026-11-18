/**
 * @file route.ts
 * @description Geocoding API endpoint providing city and locality search.
 * Rate limited per IP and validated with Zod.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { searchLocations } from '@/server/providers/openMeteoGeocoding';
import { geocodeRateLimiter, getClientIp } from '@/server/security/rateLimiter';

const querySchema = z.string().min(2).max(100);

/**
 * GET /api/geocode?q=...
 * Searches cities and locations matching the given query string.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const clientIp = getClientIp(request.headers);
  const rateLimit = geocodeRateLimiter.check(clientIp);

  if (!rateLimit.allowed) {
    const retryAfterSec = Math.ceil(rateLimit.resetMs / 1000);
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
    );
  }

  const rawQuery = request.nextUrl.searchParams.get('q') ?? '';
  const parsed = querySchema.safeParse(rawQuery.trim());

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Search query must be between 2 and 100 characters.' },
      { status: 400 },
    );
  }

  const result = await searchLocations(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ locations: result.value });
}
