/**
 * @file route.ts
 * @description Action plan generation API endpoint.
 * Validates demographic profile, enforces rate limits, and coordinates AI personalization.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { profileSchema } from '@/domain/profile/validation';
import { createPm25UgM3 } from '@/domain/types';
import { orchestratePlan } from '@/server/ai/generatePlan';
import { getClientIp, planRateLimiter } from '@/server/security/rateLimiter';

const planRequestBodySchema = z.object({
  profile: profileSchema,
  aqiSummary: z.object({
    currentPm25: z.number().min(0).max(1500),
    category: z.string().optional(),
  }),
  locale: z.enum(['en', 'hi', 'bn']).optional(),
});

function checkRateLimit(headers: Headers): { allowed: boolean; retryAfter: number } {
  const clientIp = getClientIp(headers);
  const check = planRateLimiter.check(clientIp);
  return {
    allowed: check.allowed,
    retryAfter: Math.ceil(check.resetMs / 1000),
  };
}

/**
 * POST /api/plan
 * Generates an actionable, profile-tailored lifestyle protection plan.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const rateLimit = checkRateLimit(request.headers);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded for plan generation. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload in request body.' }, { status: 400 });
  }

  const parsed = planRequestBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid plan request schema.', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { profile, aqiSummary } = parsed.data;
  const pm25 = createPm25UgM3(aqiSummary.currentPm25);
  const result = await orchestratePlan(profile, pm25);

  return NextResponse.json({
    plan: result.plan,
    meta: result.meta,
  });
}
