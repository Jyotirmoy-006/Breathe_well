/**
 * @file route.ts
 * @description POST endpoint for grounded follow-up chat Q&A with streaming text responses.
 * Enforces per-IP rate limiting, schema validation, and strict deterministic medical advice guardrails.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { streamChatResponse } from '@/server/ai/chatStream';
import { chatRateLimiter, getClientIp } from '@/server/security/rateLimiter';
import { detectPromptInjection } from '@/server/security/sanitize';

const chatRequestBodySchema = z.object({
  question: z.string().min(2).max(300),
  planContext: z.record(z.string(), z.unknown()).optional(),
  aqiSummary: z.record(z.string(), z.unknown()).optional(),
});

function checkRateLimit(headers: Headers): { allowed: boolean; retryAfter: number } {
  const clientIp = getClientIp(headers);
  const check = chatRateLimiter.check(clientIp);
  return {
    allowed: check.allowed,
    retryAfter: Math.ceil(check.resetMs / 1000),
  };
}

/**
 * POST /api/chat
 * Streams grounded answers to follow-up questions regarding the user's action plan.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const rateLimit = checkRateLimit(request.headers);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded for chat assistant. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload in request body.' }, { status: 400 });
  }

  const parsed = chatRequestBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid chat request schema.', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { question, planContext, aqiSummary } = parsed.data;

  if (detectPromptInjection(question)) {
    return NextResponse.json(
      { error: 'Query contains disallowed prompt manipulation phrases.' },
      { status: 400 },
    );
  }

  const stream = await streamChatResponse({ question, planContext, aqiSummary });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
