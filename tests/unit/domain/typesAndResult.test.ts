/**
 * @file typesAndResult.test.ts
 * @description Unit tests for branded type constructors and pure Result pattern helpers.
 */

import { describe, expect, it } from 'vitest';

import {
  createAqiIndex,
  createHourOfDay,
  createKgCo2e,
  createPercentage,
  createPm25UgM3,
  err,
  isErr,
  isOk,
  mapResult,
  ok,
} from '@/domain';

describe('Result Pattern', () => {
  it('constructs Ok and validates type guards', () => {
    const res = ok(42);
    expect(isOk(res)).toBe(true);
    expect(isErr(res)).toBe(false);
    if (isOk(res)) {
      expect(res.value).toBe(42);
    }
  });

  it('constructs Err and validates type guards', () => {
    const res = err('Something failed');
    expect(isOk(res)).toBe(false);
    expect(isErr(res)).toBe(true);
    if (isErr(res)) {
      expect(res.error).toBe('Something failed');
    }
  });

  it('mapResult transforms Ok and passes Err untouched', () => {
    const success = ok(10);
    const mappedSuccess = mapResult(success, (n) => n * 2);
    expect(isOk(mappedSuccess)).toBe(true);
    if (isOk(mappedSuccess)) {
      expect(mappedSuccess.value).toBe(20);
    }

    const failure = err('error');
    const mappedFailure = mapResult(failure, (n: number) => n * 2);
    expect(isErr(mappedFailure)).toBe(true);
  });
});

describe('Branded Type Constructors', () => {
  it('creates Pm25UgM3, AqiIndex, and KgCo2e primitives', () => {
    expect(createPm25UgM3(45)).toBe(45);
    expect(createAqiIndex(120)).toBe(120);
    expect(createKgCo2e(12.5)).toBe(12.5);
  });

  it('validates HourOfDay boundaries and rejects invalid numbers', () => {
    expect(isOk(createHourOfDay(0))).toBe(true);
    expect(isOk(createHourOfDay(23))).toBe(true);
    expect(isErr(createHourOfDay(-1))).toBe(true);
    expect(isErr(createHourOfDay(24))).toBe(true);
    expect(isErr(createHourOfDay(12.5))).toBe(true);
  });

  it('validates Percentage boundaries and rejects invalid numbers', () => {
    expect(isOk(createPercentage(0))).toBe(true);
    expect(isOk(createPercentage(50))).toBe(true);
    expect(isOk(createPercentage(100))).toBe(true);
    expect(isErr(createPercentage(-1))).toBe(true);
    expect(isErr(createPercentage(101))).toBe(true);
    expect(isErr(createPercentage(NaN))).toBe(true);
  });
});
