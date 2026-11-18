/**
 * @file routes.test.ts
 * @description Integration unit tests for Next.js App Router API endpoints.
 * Tests /api/health, /api/geocode, /api/air-quality, and /api/plan.
 */

import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET as healthGet } from '@/app/api/health/route';
import { GET as geocodeGet } from '@/app/api/geocode/route';
import { GET as airQualityGet } from '@/app/api/air-quality/route';
import { POST as planPost } from '@/app/api/plan/route';
import {
  airQualityRateLimiter,
  geocodeRateLimiter,
  planRateLimiter,
} from '@/server/security/rateLimiter';

const validProfile = {
  householdSize: 3,
  children: false,
  elderly: true,
  sensitiveGroup: false,
  homeType: 'apartment' as const,
  commuteMode: 'metro_bus' as const,
  cookingFuel: 'lpg_induction' as const,
  heatingMethod: 'electric_heater' as const,
  hasAirPurifier: true,
  budget: 'flexible' as const,
};

describe('API Route: /api/health', () => {
  it('returns 200 with status ok, mode, and uptime', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = healthGet(request);
    expect(response.status).toBe(200);

    const body: unknown = await response.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('mode');
    expect(body).toHaveProperty('uptime');
  });
});

describe('API Route: /api/geocode', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    geocodeRateLimiter.reset();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    geocodeRateLimiter.reset();
  });

  it('returns 400 when search query q is missing or under 2 characters', async () => {
    const request = new NextRequest('http://localhost:3000/api/geocode?q=a');
    const response = await geocodeGet(request);
    expect(response.status).toBe(400);

    const data: unknown = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('returns 200 with matched locations for valid query', async () => {
    const mockResults = {
      results: [{ id: 101, name: 'Delhi', latitude: 28.6, longitude: 77.2, country: 'India' }],
    };
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(mockResults), { status: 200 }));

    const request = new NextRequest('http://localhost:3000/api/geocode?q=Delhi');
    const response = await geocodeGet(request);
    expect(response.status).toBe(200);

    const data = (await response.json()) as { locations: readonly unknown[] };
    expect(data.locations).toHaveLength(1);
  });

  it('returns 429 when IP rate limit is exceeded', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ results: [] }), { status: 200 }));

    let lastResponse = await geocodeGet(
      new NextRequest('http://localhost:3000/api/geocode?q=Delhi', {
        headers: { 'x-real-ip': '192.168.10.50' },
      }),
    );

    for (let i = 0; i < 30; i++) {
      lastResponse = await geocodeGet(
        new NextRequest('http://localhost:3000/api/geocode?q=Delhi', {
          headers: { 'x-real-ip': '192.168.10.50' },
        }),
      );
    }

    expect(lastResponse.status).toBe(429);
    expect(lastResponse.headers.get('Retry-After')).toBeDefined();
  });
});

describe('API Route: /api/air-quality', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    airQualityRateLimiter.reset();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    airQualityRateLimiter.reset();
  });

  it('returns 400 when lat or lon is missing or out of valid range', async () => {
    const request = new NextRequest('http://localhost:3000/api/air-quality?lat=999&lon=77.2');
    const response = await airQualityGet(request);
    expect(response.status).toBe(400);
  });

  it('returns 200 with forecast, explainer, windows, and cache headers', async () => {
    const mockAq = {
      latitude: 28.6,
      longitude: 77.2,
      timezone: 'Asia/Kolkata',
      hourly: {
        time: ['2026-11-18T00:00:00Z', '2026-11-18T01:00:00Z'],
        pm2_5: [150.0, 180.0],
      },
    };
    const mockWeather = {
      latitude: 28.6,
      longitude: 77.2,
      timezone: 'Asia/Kolkata',
      hourly: {
        time: ['2026-11-18T00:00:00Z'],
        wind_speed_10m: [3.2],
        temperature_2m: [14.0],
        boundary_layer_height: [350],
      },
    };

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('air-quality')) {
        return Promise.resolve(new Response(JSON.stringify(mockAq), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify(mockWeather), { status: 200 }));
    });

    const request = new NextRequest('http://localhost:3000/api/air-quality?lat=28.6&lon=77.2');
    const response = await airQualityGet(request);
    expect(response.status).toBe(200);

    const cacheHeader = response.headers.get('Cache-Control');
    expect(cacheHeader).toContain('s-maxage=600');

    const body = (await response.json()) as {
      live: unknown;
      weatherExplainer: unknown;
      windows: unknown;
    };
    expect(body.live).toBeDefined();
    expect(body.weatherExplainer).toBeDefined();
    expect(body.windows).toBeDefined();
  });

  it('returns 429 when rate limit is exhausted', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ hourly: { time: [], pm2_5: [] } }), { status: 200 }),
      );

    let res = await airQualityGet(
      new NextRequest('http://localhost:3000/api/air-quality?lat=28.6&lon=77.2', {
        headers: { 'x-real-ip': '172.16.0.5' },
      }),
    );

    for (let i = 0; i < 30; i++) {
      res = await airQualityGet(
        new NextRequest('http://localhost:3000/api/air-quality?lat=28.6&lon=77.2', {
          headers: { 'x-real-ip': '172.16.0.5' },
        }),
      );
    }

    expect(res.status).toBe(429);
  });
});

describe('API Route: /api/plan', () => {
  beforeEach(() => {
    planRateLimiter.reset();
  });

  afterEach(() => {
    planRateLimiter.reset();
  });

  it('returns 400 for malformed JSON body', async () => {
    const request = new NextRequest('http://localhost:3000/api/plan', {
      method: 'POST',
      body: 'invalid-json',
    });

    const response = await planPost(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 when profile schema validation fails', async () => {
    const invalidBody = {
      profile: { ...validProfile, householdSize: 99 },
      aqiSummary: { currentPm25: 120 },
    };

    const request = new NextRequest('http://localhost:3000/api/plan', {
      method: 'POST',
      body: JSON.stringify(invalidBody),
    });

    const response = await planPost(request);
    expect(response.status).toBe(400);
  });

  it('returns 200 with plan and rule-based metadata on valid input', async () => {
    const validBody = {
      profile: validProfile,
      aqiSummary: { currentPm25: 150 },
    };

    const request = new NextRequest('http://localhost:3000/api/plan', {
      method: 'POST',
      body: JSON.stringify(validBody),
    });

    const response = await planPost(request);
    expect(response.status).toBe(200);

    const body = (await response.json()) as { plan: unknown; meta: { mode: string } };
    expect(body.plan).toBeDefined();
    expect(body.meta.mode).toBe('rule-based');
  });

  it('returns 429 when plan rate limit (10 req/min) is exceeded', async () => {
    const validBody = {
      profile: validProfile,
      aqiSummary: { currentPm25: 100 },
    };

    let res = await planPost(
      new NextRequest('http://localhost:3000/api/plan', {
        method: 'POST',
        headers: { 'x-real-ip': '10.50.0.9' },
        body: JSON.stringify(validBody),
      }),
    );

    for (let i = 0; i < 10; i++) {
      res = await planPost(
        new NextRequest('http://localhost:3000/api/plan', {
          method: 'POST',
          headers: { 'x-real-ip': '10.50.0.9' },
          body: JSON.stringify(validBody),
        }),
      );
    }

    expect(res.status).toBe(429);
  });
});
