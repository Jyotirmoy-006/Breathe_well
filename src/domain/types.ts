/**
 * @file types.ts
 * @description Branded primitive types and construction helpers for domain units.
 */

import { err, ok } from './result';
import type { Result } from './result';

declare const __brand: unique symbol;

/**
 * Utility type for creating nominal branded primitives in TypeScript.
 */
export type Brand<T, B> = T & { readonly [__brand]: B };

/**
 * Branded number representing PM2.5 concentration in micrograms per cubic metre (µg/m³).
 */
export type Pm25UgM3 = Brand<number, 'Pm25UgM3'>;

/**
 * Branded number representing Air Quality Index (AQI) value.
 */
export type AqiIndex = Brand<number, 'AqiIndex'>;

/**
 * Branded integer representing hour of the day (0 to 23).
 */
export type HourOfDay = Brand<number, 'HourOfDay'>;

/**
 * Branded number representing a percentage (0 to 100).
 */
export type Percentage = Brand<number, 'Percentage'>;

/**
 * Branded number representing mass of carbon dioxide equivalent in kilograms (kg CO2e).
 */
export type KgCo2e = Brand<number, 'KgCo2e'>;

/**
 * Constructs a branded Pm25UgM3 from a number.
 * @param value - Concentration in µg/m³.
 */
export function createPm25UgM3(value: number): Pm25UgM3 {
  return value as Pm25UgM3;
}

/**
 * Constructs a branded AqiIndex from a number.
 * @param value - AQI value.
 */
export function createAqiIndex(value: number): AqiIndex {
  return value as AqiIndex;
}

/**
 * Constructs a validated branded HourOfDay.
 * @param value - Integer between 0 and 23 inclusive.
 */
export function createHourOfDay(value: number): Result<HourOfDay, string> {
  if (!Number.isInteger(value) || value < 0 || value > 23) {
    return err(`HourOfDay must be an integer between 0 and 23. Received: ${String(value)}`);
  }
  return ok(value as HourOfDay);
}

/**
 * Constructs a validated branded Percentage.
 * @param value - Number between 0 and 100 inclusive.
 */
export function createPercentage(value: number): Result<Percentage, string> {
  if (Number.isNaN(value) || value < 0 || value > 100) {
    return err(`Percentage must be between 0 and 100. Received: ${String(value)}`);
  }
  return ok(value as Percentage);
}

/**
 * Constructs a branded KgCo2e from a number.
 * @param value - Mass in kg CO2e.
 */
export function createKgCo2e(value: number): KgCo2e {
  return value as KgCo2e;
}
