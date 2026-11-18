/**
 * @file route.ts
 * @description Health check API endpoint.
 * Returns application status, timestamp, and AI mode.
 */

import { type NextRequest, NextResponse } from 'next/server';

import { isAiEnabled } from '@/server/env';

/** Health check response shape. */
interface HealthResponse {
  status: 'ok';
  timestamp: string;
  mode: 'ai' | 'rule-based';
}

/**
 * GET /api/health
 * Returns the current application health status.
 */
export function GET(_request: NextRequest): NextResponse<HealthResponse> {
  const response: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: isAiEnabled ? 'ai' : 'rule-based',
  };
  return NextResponse.json(response);
}
