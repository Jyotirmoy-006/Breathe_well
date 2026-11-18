/**
 * @file apiContract.test.ts
 * @description API contract tests verifying input validation, 4xx statuses, error schemas, and absence of stack traces.
 */

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it } from 'vitest';

import { GET as airQualityGet } from '@/app/api/air-quality/route';
import { POST as chatPost } from '@/app/api/chat/route';
import { GET as geocodeGet } from '@/app/api/geocode/route';
import { POST as planPost } from '@/app/api/plan/route';
import {
  airQualityRateLimiter,
  chatRateLimiter,
  geocodeRateLimiter,
  planRateLimiter,
} from '@/server/security/rateLimiter';

describe('API Contract & Input Validation Tests', () => {
  beforeEach(() => {
    airQualityRateLimiter.reset();
    geocodeRateLimiter.reset();
    planRateLimiter.reset();
    chatRateLimiter.reset();
  });

  describe('GET /api/air-quality', () => {
    it('rejects out-of-range coordinates with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/air-quality?lat=999&lon=45');
      const res = await airQualityGet(req);
      expect(res.status).toBe(400);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toHaveProperty('error');
      expect(JSON.stringify(body)).not.toMatch(/stack|src\/|Trace/i);
    });

    it('rejects non-numeric coordinate types with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/air-quality?lat=abc&lon=def');
      const res = await airQualityGet(req);
      expect(res.status).toBe(400);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toHaveProperty('error');
    });
  });

  describe('GET /api/geocode', () => {
    it('rejects missing search query q with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/geocode');
      const res = await geocodeGet(req);
      expect(res.status).toBe(400);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toHaveProperty('error');
      expect(JSON.stringify(body)).not.toMatch(/stack|src\/|Trace/i);
    });

    it('rejects single-character query (<2 characters) with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/geocode?q=x');
      const res = await geocodeGet(req);
      expect(res.status).toBe(400);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toHaveProperty('error');
    });
  });

  describe('POST /api/plan', () => {
    it('rejects malformed JSON payload with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"unclosed_json: true,',
      });
      const res = await planPost(req);
      expect(res.status).toBe(400);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body.error).toBe('Malformed JSON payload in request body.');
      expect(JSON.stringify(body)).not.toMatch(/SyntaxError|at |node_modules/);
    });

    it('rejects missing required profile fields with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aqiSummary: { currentPm25: 120 } }),
      });
      const res = await planPost(req);
      expect(res.status).toBe(400);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toHaveProperty('error', 'Invalid plan request schema.');
      expect(JSON.stringify(body)).not.toMatch(/stack|Trace/i);
    });

    it('rejects wrong types in profile with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            commuteMode: 12345, // invalid type
            cookingFuel: 'nuclear', // invalid enum
          },
          aqiSummary: { currentPm25: 'not-a-number' },
        }),
      });
      const res = await planPost(req);
      expect(res.status).toBe(400);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toHaveProperty('error');
    });

    it('rejects oversize bodies with 400 or schema validation failure without crashing', async () => {
      const largeString = 'x'.repeat(150_000);
      const req = new NextRequest('http://localhost:3000/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ junk: largeString }),
      });
      const res = await planPost(req);
      expect(res.status).toBe(400);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toHaveProperty('error');
      expect(JSON.stringify(body)).not.toMatch(/stack|Trace/i);
    });
  });

  describe('POST /api/chat', () => {
    it('rejects malformed JSON with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{not valid json}',
      });
      const res = await chatPost(req);
      expect(res.status).toBe(400);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body.error).toBe('Malformed JSON payload in request body.');
    });

    it('rejects empty or whitespace-only questions (<2 chars) with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: ' ' }),
      });
      const res = await chatPost(req);
      expect(res.status).toBe(400);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toHaveProperty('error');
      expect(JSON.stringify(body)).not.toMatch(/stack|Trace/i);
    });

    it('rejects overly long questions (>300 chars) with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'a'.repeat(305) }),
      });
      const res = await chatPost(req);
      expect(res.status).toBe(400);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toHaveProperty('error');
    });
  });
});
