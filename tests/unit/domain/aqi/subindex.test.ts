/**
 * @file subindex.test.ts
 * @description Unit tests for CPCB AQI sub-index linear interpolation and plain language verdicts.
 */

import { describe, expect, it } from 'vitest';

import {
  computeCpcbSubIndex,
  createPm25UgM3,
  getAqiCategoryVerdict,
  getAqiHealthRecommendation,
} from '@/domain/aqi';
import type { AqiCategory } from '@/domain/aqi';

describe('computeCpcbSubIndex', () => {
  it('computes exact sub-index at Good breakpoints', () => {
    expect(computeCpcbSubIndex(createPm25UgM3(0))).toBe(0);
    expect(computeCpcbSubIndex(createPm25UgM3(15))).toBe(25);
    expect(computeCpcbSubIndex(createPm25UgM3(30))).toBe(50);
  });

  it('computes exact sub-index at Satisfactory breakpoints', () => {
    expect(computeCpcbSubIndex(createPm25UgM3(31))).toBe(51);
    expect(computeCpcbSubIndex(createPm25UgM3(60))).toBe(100);
  });

  it('computes exact sub-index at Moderate breakpoints', () => {
    expect(computeCpcbSubIndex(createPm25UgM3(61))).toBe(101);
    expect(computeCpcbSubIndex(createPm25UgM3(75))).toBe(149);
    expect(computeCpcbSubIndex(createPm25UgM3(90))).toBe(200);
  });

  it('computes exact sub-index at Poor breakpoints', () => {
    expect(computeCpcbSubIndex(createPm25UgM3(91))).toBe(201);
    expect(computeCpcbSubIndex(createPm25UgM3(120))).toBe(300);
  });

  it('computes exact sub-index at Very Poor breakpoints', () => {
    expect(computeCpcbSubIndex(createPm25UgM3(121))).toBe(301);
    expect(computeCpcbSubIndex(createPm25UgM3(250))).toBe(400);
  });

  it('computes exact sub-index at Severe breakpoints', () => {
    expect(computeCpcbSubIndex(createPm25UgM3(251))).toBe(401);
    expect(computeCpcbSubIndex(createPm25UgM3(350))).toBe(500);
  });

  it('caps at 500 when concentration exceeds 350 µg/m³', () => {
    expect(computeCpcbSubIndex(createPm25UgM3(450))).toBe(500);
    expect(computeCpcbSubIndex(createPm25UgM3(999))).toBe(500);
  });

  it('handles negative or NaN inputs safely', () => {
    expect(computeCpcbSubIndex(createPm25UgM3(-10))).toBe(0);
    expect(computeCpcbSubIndex(createPm25UgM3(NaN))).toBe(0);
  });
});

describe('getAqiCategoryVerdict & getAqiHealthRecommendation', () => {
  const categories: readonly AqiCategory[] = [
    'Good',
    'Satisfactory',
    'Moderate',
    'Poor',
    'Very Poor',
    'Severe',
  ];

  it('provides non-empty verdict for every CPCB category', () => {
    for (const cat of categories) {
      const verdict = getAqiCategoryVerdict(cat);
      expect(verdict).toBeDefined();
      expect(verdict.length).toBeGreaterThan(10);
    }
  });

  it('provides non-empty health recommendation for every CPCB category', () => {
    for (const cat of categories) {
      const rec = getAqiHealthRecommendation(cat);
      expect(rec).toBeDefined();
      expect(rec.length).toBeGreaterThan(10);
    }
  });
});
