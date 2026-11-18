/**
 * @file route.ts
 * @description Health check API endpoint.
 * Returns application status, timestamp, AI mode, and process uptime.
 */

import { type NextRequest, NextResponse } from 'next/server';

import { isAiEnabled } from '@/server/env';

/** Health check response payload shape. */
export interface HealthResponse {
  readonly status: 'ok';
  readonly timestamp: string;
  readonly mode: 'ai' | 'rule-based';
  readonly uptime: number;
}

/**
 * GET /api/health
 * Returns the current application health status, execution mode, and server uptime.
 */
export function GET(_request: NextRequest): NextResponse<HealthResponse> {
  const response: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: isAiEnabled ? 'ai' : 'rule-based',
    uptime: process.uptime(),
  };
  return NextResponse.json(response);
}
