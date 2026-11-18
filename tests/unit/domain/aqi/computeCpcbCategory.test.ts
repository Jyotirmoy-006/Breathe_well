/**
 * @file computeCpcbCategory.test.ts
 * @description Unit tests for computeCpcbCategory and AQI domain helpers — all CPCB boundary values.
 * Fully deterministic, no IO, no network.
 */

import { describe, expect, it } from 'vitest';

import {
  computeCpcbCategory,
  computeWhoMultiple,
  createAqiIndex,
  createPm25UgM3,
} from '@/domain/aqi';

describe('computeCpcbCategory', () => {
  it('returns Good for PM2.5 = 0 µg/m³', () => {
    expect(computeCpcbCategory(createPm25UgM3(0))).toBe('Good');
  });

  it('returns Good for PM2.5 = 30 µg/m³ (upper boundary)', () => {
    expect(computeCpcbCategory(createPm25UgM3(30))).toBe('Good');
  });

  it('returns Satisfactory for PM2.5 = 31 µg/m³ (lower boundary)', () => {
    expect(computeCpcbCategory(createPm25UgM3(31))).toBe('Satisfactory');
  });

  it('returns Satisfactory for PM2.5 = 60 µg/m³ (upper boundary)', () => {
    expect(computeCpcbCategory(createPm25UgM3(60))).toBe('Satisfactory');
  });

  it('returns Moderate for PM2.5 = 61 µg/m³ (lower boundary)', () => {
    expect(computeCpcbCategory(createPm25UgM3(61))).toBe('Moderate');
  });

  it('returns Moderate for PM2.5 = 90 µg/m³ (upper boundary)', () => {
    expect(computeCpcbCategory(createPm25UgM3(90))).toBe('Moderate');
  });

  it('returns Poor for PM2.5 = 91 µg/m³ (lower boundary)', () => {
    expect(computeCpcbCategory(createPm25UgM3(91))).toBe('Poor');
  });

  it('returns Poor for PM2.5 = 120 µg/m³ (upper boundary)', () => {
    expect(computeCpcbCategory(createPm25UgM3(120))).toBe('Poor');
  });

  it('returns Very Poor for PM2.5 = 121 µg/m³ (lower boundary)', () => {
    expect(computeCpcbCategory(createPm25UgM3(121))).toBe('Very Poor');
  });

  it('returns Very Poor for PM2.5 = 250 µg/m³ (upper boundary)', () => {
    expect(computeCpcbCategory(createPm25UgM3(250))).toBe('Very Poor');
  });

  it('returns Severe for PM2.5 = 251 µg/m³ (lower boundary)', () => {
    expect(computeCpcbCategory(createPm25UgM3(251))).toBe('Severe');
  });

  it('returns Severe for PM2.5 = 999 µg/m³ (extreme value)', () => {
    expect(computeCpcbCategory(createPm25UgM3(999))).toBe('Severe');
  });

  it('returns Severe for NaN (fallback path)', () => {
    expect(computeCpcbCategory(createPm25UgM3(NaN))).toBe('Severe');
  });
});

describe('computeWhoMultiple', () => {
  it('returns 1.0 when PM2.5 equals WHO 24h guideline (15 µg/m³)', () => {
    expect(computeWhoMultiple(createPm25UgM3(15))).toBe(1);
  });

  it('returns 2.0 when PM2.5 is 30 µg/m³', () => {
    expect(computeWhoMultiple(createPm25UgM3(30))).toBe(2);
  });

  it('returns 10.0 when PM2.5 is 150 µg/m³', () => {
    expect(computeWhoMultiple(createPm25UgM3(150))).toBe(10);
  });
});

describe('createAqiIndex', () => {
  it('creates branded AqiIndex from raw number', () => {
    const aqi = createAqiIndex(350);
    expect(aqi).toBe(350);
  });
});
