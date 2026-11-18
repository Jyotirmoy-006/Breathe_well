/**
 * @file index.ts
 * @description Central export point for external meteorological and geocoding providers.
 */

export { searchLocations } from './openMeteoGeocoding';
export type { GeocodingMatch } from './openMeteoGeocoding';

export { fetchAirQualityForecast } from './openMeteoAirQuality';
export type {
  AirQualityForecastData,
  HourlyAirQualityReading,
  LiveAirQualitySummary,
} from './openMeteoAirQuality';

export {
  fetchWeatherExplainer,
  STAGNANT_WIND_THRESHOLD_KMH,
  SHALLOW_BOUNDARY_LAYER_THRESHOLD_M,
} from './openMeteoForecast';
export type { WeatherExplainer } from './openMeteoForecast';
