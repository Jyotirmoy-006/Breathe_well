/**
 * @file route.ts
 * @description Air quality API endpoint returning real-time metrics, 48h forecast, and weather explainer.
 * Rate limited per IP, validated with Zod, and cached at edge.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { analyzeTimelineWindows } from '@/domain/planner/bestWindow';
import type { TimelineForecastPoint } from '@/domain/planner/bestWindow';
import { createPm25UgM3 } from '@/domain/types';
import { fetchAirQualityForecast } from '@/server/providers/openMeteoAirQuality';
import { fetchWeatherExplainer } from '@/server/providers/openMeteoForecast';
import { airQualityRateLimiter, getClientIp } from '@/server/security/rateLimiter';

const coordinatesSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

const ATTRIBUTION_INFO = {
  source: 'Open-Meteo',
  url: 'https://open-meteo.com/',
  notice: 'Weather and air quality data courtesy of Open-Meteo.com under CC BY 4.0',
} as const;

function checkRateLimit(headers: Headers): { allowed: boolean; retryAfter: number } {
  const clientIp = getClientIp(headers);
  const check = airQualityRateLimiter.check(clientIp);
  return {
    allowed: check.allowed,
    retryAfter: Math.ceil(check.resetMs / 1000),
  };
}

/**
 * GET /api/air-quality?lat=...&lon=...
 * Returns live AQI, 48-hour forecast, timeline windows, and atmospheric explainer.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const rateLimit = checkRateLimit(request.headers);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
    );
  }

  const rawLat = request.nextUrl.searchParams.get('lat');
  const rawLon = request.nextUrl.searchParams.get('lon');
  const parsed = coordinatesSchema.safeParse({ lat: rawLat, lon: rawLon });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid coordinates. Latitude [-90, 90], Longitude [-180, 180].' },
      { status: 400 },
    );
  }

  const { lat, lon } = parsed.data;
  const [aqResult, weatherResult] = await Promise.all([
    fetchAirQualityForecast(lat, lon),
    fetchWeatherExplainer(lat, lon),
  ]);

  if (!aqResult.ok) {
    return NextResponse.json({ error: aqResult.error }, { status: 502 });
  }

  const forecast = aqResult.value;
  const timeline: TimelineForecastPoint[] = forecast.hourly.map((h) => ({
    hourIso: h.hourIso,
    pm25: createPm25UgM3(h.pm25),
  }));
  const windows = analyzeTimelineWindows(timeline);

  const payload = {
    live: forecast.live,
    hourly: forecast.hourly,
    cpcbCategory: forecast.live.cpcbCategory,
    whoMultiple: forecast.live.whoMultiple,
    weatherExplainer: weatherResult.ok ? weatherResult.value : null,
    windows,
    attribution: ATTRIBUTION_INFO,
  };

  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=120' },
  });
}
