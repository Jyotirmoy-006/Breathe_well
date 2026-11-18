/**
 * @file openMeteoForecast.ts
 * @description Provider for Open-Meteo Weather Forecast API.
 * Detects atmospheric stagnation, boundary layer traps, and temperature inversions.
 */

import { z } from 'zod';

import { err, ok } from '@/domain/result';
import type { Result } from '@/domain/result';
import { fetchJsonWithAllowlist } from '@/server/security/fetchAllowlist';

/** Threshold below which horizontal air movement is considered stagnant: 5 km/h. */
export const STAGNANT_WIND_THRESHOLD_KMH = 5 as const;

/** Threshold below which the planetary boundary layer traps pollutants near ground: 500 m. */
export const SHALLOW_BOUNDARY_LAYER_THRESHOLD_M = 500 as const;

const forecastResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  hourly: z.object({
    time: z.array(z.string()),
    wind_speed_10m: z.array(z.number().nullable()),
    temperature_2m: z.array(z.number().nullable()),
    boundary_layer_height: z.array(z.number().nullable()).optional(),
  }),
});

type RawForecastResponse = z.infer<typeof forecastResponseSchema>;

/** Structured atmospheric explainer identifying why pollution is trapped. */
export interface WeatherExplainer {
  readonly isStagnant: boolean;
  readonly isShallowBoundaryLayer: boolean;
  readonly hasTemperatureInversion: boolean;
  readonly summary: string;
  readonly factors: readonly string[];
  readonly currentWindSpeedKmh: number;
  readonly currentBoundaryLayerHeightM: number;
  readonly currentTemperatureC: number;
}

const BASE_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast' as const;

function evaluateInversion(temp: number, boundaryHeight: number, windSpeed: number): boolean {
  return (
    (boundaryHeight < SHALLOW_BOUNDARY_LAYER_THRESHOLD_M && windSpeed < 8) ||
    (temp <= 15 && boundaryHeight < 600)
  );
}

function compileFactors(stagnant: boolean, shallow: boolean, inversion: boolean): string[] {
  const factors: string[] = [];
  if (stagnant) {
    factors.push('Calm surface winds (< 5 km/h) prevent horizontal ventilation.');
  }
  if (shallow) {
    factors.push('Compressed boundary layer (< 500m) confines emissions to ground level.');
  }
  if (inversion) {
    factors.push(
      'Thermal inversion lid prevents upward dispersion of smoke and particulate matter.',
    );
  }
  if (factors.length === 0) {
    factors.push('Favorable atmospheric dispersion and ventilation conditions detected.');
  }
  return factors;
}

function compileSummary(stagnant: boolean, shallow: boolean, inversion: boolean): string {
  if (stagnant && shallow) {
    return 'Severe atmospheric trapping: stagnant surface winds and a compressed boundary layer are preventing pollution dispersion.';
  }
  if (inversion) {
    return 'Thermal inversion layer is trapping particulate matter close to breathing height.';
  }
  if (stagnant) {
    return 'Light wind conditions are allowing vehicular and biomass emissions to accumulate.';
  }
  if (shallow) {
    return 'Low mixing height is restricting vertical dilution of ambient pollutants.';
  }
  return 'Atmospheric conditions currently permit moderate natural ventilation.';
}

function buildExplainer(raw: RawForecastResponse): WeatherExplainer {
  const wind = raw.hourly.wind_speed_10m[0] ?? 0;
  const temp = raw.hourly.temperature_2m[0] ?? 20;
  const boundary = raw.hourly.boundary_layer_height?.[0] ?? 600;

  const isStagnant = wind < STAGNANT_WIND_THRESHOLD_KMH;
  const isShallowBoundaryLayer = boundary < SHALLOW_BOUNDARY_LAYER_THRESHOLD_M;
  const hasTemperatureInversion = evaluateInversion(temp, boundary, wind);

  return {
    isStagnant,
    isShallowBoundaryLayer,
    hasTemperatureInversion,
    summary: compileSummary(isStagnant, isShallowBoundaryLayer, hasTemperatureInversion),
    factors: compileFactors(isStagnant, isShallowBoundaryLayer, hasTemperatureInversion),
    currentWindSpeedKmh: wind,
    currentBoundaryLayerHeightM: boundary,
    currentTemperatureC: temp,
  };
}

/**
 * Fetches meteorological variables to analyze atmospheric ventilation and dispersion.
 *
 * @param latitude - Target latitude.
 * @param longitude - Target longitude.
 * @returns Result containing WeatherExplainer or error description.
 */
export async function fetchWeatherExplainer(
  latitude: number,
  longitude: number,
): Promise<Result<WeatherExplainer, string>> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    hourly: 'wind_speed_10m,temperature_2m,boundary_layer_height',
    forecast_days: '2',
    timezone: 'auto',
  });
  const url = `${BASE_FORECAST_URL}?${params.toString()}`;

  try {
    const rawData = await fetchJsonWithAllowlist<unknown>(url);
    const parsed = forecastResponseSchema.safeParse(rawData);

    if (!parsed.success) {
      return err('Failed to validate forecast API response schema.');
    }

    return ok(buildExplainer(parsed.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Forecast fetch failed.';
    return err(message);
  }
}
