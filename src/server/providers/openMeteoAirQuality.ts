/**
 * @file openMeteoAirQuality.ts
 * @description Provider for Open-Meteo Air Quality API.
 * Fetches 48-hour hourly pollutant data and derives CPCB AQI categories and WHO guidelines.
 */

import { z } from 'zod';

import {
  computeCpcbCategory,
  computeCpcbSubIndex,
  computeWhoMultiple,
  getAqiCategoryVerdict,
} from '@/domain/aqi';
import type { AqiCategory } from '@/domain/aqi';
import { err, ok } from '@/domain/result';
import type { Result } from '@/domain/result';
import { createPm25UgM3 } from '@/domain/types';
import { fetchJsonWithAllowlist } from '@/server/security/fetchAllowlist';

const airQualityResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  hourly: z.object({
    time: z.array(z.string()),
    pm2_5: z.array(z.number().nullable()),
    pm10: z.array(z.number().nullable()).optional(),
    nitrogen_dioxide: z.array(z.number().nullable()).optional(),
    us_aqi: z.array(z.number().nullable()).optional(),
  }),
});

type RawAirQualityResponse = z.infer<typeof airQualityResponseSchema>;

/** Individual hourly air quality reading with computed CPCB metrics. */
export interface HourlyAirQualityReading {
  readonly hourIso: string;
  readonly pm25: number;
  readonly pm10?: number | undefined;
  readonly no2?: number | undefined;
  readonly usAqi?: number | undefined;
  readonly cpcbSubIndex: number;
  readonly cpcbCategory: AqiCategory;
  readonly whoMultiple: number;
}

/** Real-time or latest available air quality summary. */
export interface LiveAirQualitySummary {
  readonly pm25: number;
  readonly pm10?: number | undefined;
  readonly no2?: number | undefined;
  readonly usAqi?: number | undefined;
  readonly cpcbSubIndex: number;
  readonly cpcbCategory: AqiCategory;
  readonly verdict: string;
  readonly whoMultiple: number;
  readonly recordedAtIso: string;
}

/** Complete air quality forecast payload. */
export interface AirQualityForecastData {
  readonly latitude: number;
  readonly longitude: number;
  readonly timezone: string;
  readonly live: LiveAirQualitySummary;
  readonly hourly: readonly HourlyAirQualityReading[];
}

const BASE_AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality' as const;

interface RawHourSlice {
  readonly pm25: number | null;
  readonly pm10?: number | null | undefined;
  readonly no2?: number | null | undefined;
  readonly usAqi?: number | null | undefined;
}

function buildReading(time: string, raw: RawHourSlice): HourlyAirQualityReading {
  const pm25Value = raw.pm25 !== null && raw.pm25 >= 0 ? raw.pm25 : 0;
  const pm25Branded = createPm25UgM3(pm25Value);
  const cpcbCategory = computeCpcbCategory(pm25Branded);
  const cpcbSubIndex = computeCpcbSubIndex(pm25Branded);
  const whoMultiple = computeWhoMultiple(pm25Branded);

  return {
    hourIso: time,
    pm25: pm25Value,
    pm10: raw.pm10 ?? undefined,
    no2: raw.no2 ?? undefined,
    usAqi: raw.usAqi ?? undefined,
    cpcbSubIndex,
    cpcbCategory,
    whoMultiple,
  };
}

function transformRawResponse(raw: RawAirQualityResponse): AirQualityForecastData {
  const { time, pm2_5, pm10, nitrogen_dioxide, us_aqi } = raw.hourly;
  const hourly: HourlyAirQualityReading[] = time.map((t, idx) =>
    buildReading(t, {
      pm25: pm2_5[idx] ?? null,
      pm10: pm10?.[idx],
      no2: nitrogen_dioxide?.[idx],
      usAqi: us_aqi?.[idx],
    }),
  );

  const firstReading = hourly[0] ?? buildReading(new Date().toISOString(), { pm25: 0 });
  const live: LiveAirQualitySummary = {
    pm25: firstReading.pm25,
    pm10: firstReading.pm10,
    no2: firstReading.no2,
    usAqi: firstReading.usAqi,
    cpcbSubIndex: firstReading.cpcbSubIndex,
    cpcbCategory: firstReading.cpcbCategory,
    verdict: getAqiCategoryVerdict(firstReading.cpcbCategory),
    whoMultiple: firstReading.whoMultiple,
    recordedAtIso: firstReading.hourIso,
  };

  return { latitude: raw.latitude, longitude: raw.longitude, timezone: raw.timezone, live, hourly };
}

/**
 * Fetches 48-hour air quality forecast for a specified latitude and longitude.
 *
 * @param latitude - Latitude coordinate (-90 to 90).
 * @param longitude - Longitude coordinate (-180 to 180).
 * @returns Result containing transformed AirQualityForecastData or error message.
 */
export async function fetchAirQualityForecast(
  latitude: number,
  longitude: number,
): Promise<Result<AirQualityForecastData, string>> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    hourly: 'pm2_5,pm10,nitrogen_dioxide,us_aqi',
    forecast_days: '2',
    timezone: 'auto',
  });
  const url = `${BASE_AIR_QUALITY_URL}?${params.toString()}`;

  try {
    const rawData = await fetchJsonWithAllowlist<unknown>(url);
    const parsed = airQualityResponseSchema.safeParse(rawData);

    if (!parsed.success) {
      return err('Failed to validate air quality API response schema.');
    }

    return ok(transformRawResponse(parsed.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Air quality fetch failed.';
    return err(message);
  }
}
