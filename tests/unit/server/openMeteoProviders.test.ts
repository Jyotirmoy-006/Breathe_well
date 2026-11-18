/**
 * @file openMeteoProviders.test.ts
 * @description Unit tests for Open-Meteo geocoding, air quality, and meteorological providers.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchAirQualityForecast,
  fetchWeatherExplainer,
  searchLocations,
} from '@/server/providers';

describe('openMeteoGeocoding provider', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('rejects queries shorter than 2 characters with validation error', async () => {
    const result = await searchLocations('a');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('at least 2 characters');
    }
  });

  it('transforms valid geocoding API response into GeocodingMatch records', async () => {
    const mockApiResponse = {
      results: [
        {
          id: 1273294,
          name: 'Delhi',
          latitude: 28.65195,
          longitude: 77.23149,
          admin1: 'Delhi',
          country: 'India',
        },
      ],
    };

    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(mockApiResponse), { status: 200 }));

    const result = await searchLocations('Delhi');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0]?.name).toBe('Delhi');
      expect(result.value[0]?.latitude).toBe(28.65195);
    }
  });

  it('returns empty array when API returns no matched locations', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

    const result = await searchLocations('NonExistentPlaceXYZ');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(0);
    }
  });

  it('handles geocoding schema parse failures gracefully', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ results: 'not-an-array' }), { status: 200 }),
      );

    const result = await searchLocations('Delhi');
    expect(result.ok).toBe(false);
  });

  it('handles geocoding network errors gracefully', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    const result = await searchLocations('Delhi');
    expect(result.ok).toBe(false);
  });
});

describe('openMeteoAirQuality provider', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('parses hourly readings and derives CPCB AQI metrics', async () => {
    const mockAirData = {
      latitude: 28.6,
      longitude: 77.2,
      timezone: 'Asia/Kolkata',
      hourly: {
        time: ['2026-11-18T00:00:00Z', '2026-11-18T01:00:00Z'],
        pm2_5: [180.5, 320.0],
        pm10: [250.0, 420.0],
        nitrogen_dioxide: [45.0, 60.0],
        us_aqi: [230, 370],
      },
    };

    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(mockAirData), { status: 200 }));

    const result = await fetchAirQualityForecast(28.6, 77.2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.hourly).toHaveLength(2);
      expect(result.value.live.pm25).toBe(180.5);
      expect(result.value.live.cpcbCategory).toBe('Very Poor');
      expect(result.value.hourly[1]?.cpcbCategory).toBe('Severe');
      expect(result.value.live.whoMultiple).toBeGreaterThan(10);
    }
  });

  it('handles null/missing pollutant readings and network errors', async () => {
    const mockSparseData = {
      latitude: 28.6,
      longitude: 77.2,
      timezone: 'Asia/Kolkata',
      hourly: {
        time: ['2026-11-18T00:00:00Z'],
        pm2_5: [null],
      },
    };

    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(mockSparseData), { status: 200 }));

    const result = await fetchAirQualityForecast(28.6, 77.2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.live.pm25).toBe(0);
      expect(result.value.live.cpcbCategory).toBe('Good');
    }

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Fetch timeout'));
    const failResult = await fetchAirQualityForecast(28.6, 77.2);
    expect(failResult.ok).toBe(false);
  });
});

describe('openMeteoForecast provider (explainer)', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('detects stagnant air and compressed boundary layer under calm winter conditions', async () => {
    const mockWeatherData = {
      latitude: 28.6,
      longitude: 77.2,
      timezone: 'Asia/Kolkata',
      hourly: {
        time: ['2026-11-18T00:00:00Z'],
        wind_speed_10m: [2.5],
        temperature_2m: [12.0],
        boundary_layer_height: [280],
      },
    };

    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(mockWeatherData), { status: 200 }));

    const result = await fetchWeatherExplainer(28.6, 77.2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.isStagnant).toBe(true);
      expect(result.value.isShallowBoundaryLayer).toBe(true);
      expect(result.value.hasTemperatureInversion).toBe(true);
      expect(result.value.summary).toContain('stagnant surface winds');
      expect(result.value.factors.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('detects favorable dispersion when wind is strong and boundary layer is deep', async () => {
    const mockClearData = {
      latitude: 28.6,
      longitude: 77.2,
      timezone: 'Asia/Kolkata',
      hourly: {
        time: ['2026-11-18T00:00:00Z'],
        wind_speed_10m: [18.0],
        temperature_2m: [25.0],
        boundary_layer_height: [1200],
      },
    };

    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(mockClearData), { status: 200 }));

    const result = await fetchWeatherExplainer(28.6, 77.2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.isStagnant).toBe(false);
      expect(result.value.isShallowBoundaryLayer).toBe(false);
      expect(result.value.hasTemperatureInversion).toBe(false);
      expect(result.value.summary).toContain('moderate natural ventilation');
    }
  });

  it('handles stagnant-only and shallow-only atmospheric conditions', async () => {
    const mockStagnantOnly = {
      latitude: 28.6,
      longitude: 77.2,
      timezone: 'Asia/Kolkata',
      hourly: {
        time: ['2026-11-18T00:00:00Z'],
        wind_speed_10m: [3.0],
        temperature_2m: [25.0],
        boundary_layer_height: [800],
      },
    };

    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(mockStagnantOnly), { status: 200 }));

    const stagResult = await fetchWeatherExplainer(28.6, 77.2);
    expect(stagResult.ok).toBe(true);
    if (stagResult.ok) {
      expect(stagResult.value.isStagnant).toBe(true);
      expect(stagResult.value.summary).toContain('Light wind conditions');
    }

    const mockShallowOnly = {
      latitude: 28.6,
      longitude: 77.2,
      timezone: 'Asia/Kolkata',
      hourly: {
        time: ['2026-11-18T00:00:00Z'],
        wind_speed_10m: [12.0],
        temperature_2m: [22.0],
        boundary_layer_height: [350],
      },
    };

    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(mockShallowOnly), { status: 200 }));

    const shallowResult = await fetchWeatherExplainer(28.6, 77.2);
    expect(shallowResult.ok).toBe(true);
    if (shallowResult.ok) {
      expect(shallowResult.value.isShallowBoundaryLayer).toBe(true);
      expect(shallowResult.value.summary).toContain('Low mixing height');
    }

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const errResult = await fetchWeatherExplainer(28.6, 77.2);
    expect(errResult.ok).toBe(false);
  });
});
