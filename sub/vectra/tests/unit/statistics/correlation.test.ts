/**
 * statistics.correlation vector helper를 검증한다.
 * perfect linear correlation, fractional correlation, zero variance, covariance와 공유하는 validation을 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { correlation } from '../../../src/statistics/correlation';

describe('correlation — perfect linear', () => {
  test('perfect positive correlation은 1', () => {
    // first=[1, 2, 3, 4], second=[2, 4, 6, 8] (=2x): correlation = 1
    expect(correlation([1, 2, 3, 4], [2, 4, 6, 8])).toBe(1);
  });

  test('perfect negative correlation은 -1', () => {
    // first=[1, 2, 3, 4], second=[8, 6, 4, 2] (=-2x+10): correlation = -1
    expect(correlation([1, 2, 3, 4], [8, 6, 4, 2])).toBe(-1);
  });

  test('동일 vector self-correlation은 1', () => {
    expect(correlation([1, 2, 3], [1, 2, 3])).toBe(1);
  });

  test('offset이 다른 linear는 여전히 1', () => {
    // first=[1, 2, 3], second=[11, 12, 13]: 같은 linear shape
    expect(correlation([1, 2, 3], [11, 12, 13])).toBe(1);
  });
});

describe('correlation — fractional', () => {
  test('비선형 partial correlation은 [−1, 1] 범위 안 fractional', () => {
    // first=[1, 2, 3, 4], second=[1, 4, 9, 16] (=x²): meanX=2.5, meanY=7.5
    // productSum=25, squaredSumX=5, squaredSumY=129 → r = 25/sqrt(645)
    const r = correlation([1, 2, 3, 4], [1, 4, 9, 16]);
    expect(r).toBeGreaterThan(0);
    expect(r).toBeLessThan(1);
    expect(r).toBeCloseTo(25 / Math.sqrt(645), 12);
  });

  test('default mode와 sample mode 결과는 같다 (denominator 소거)', () => {
    const first = [1, 2, 3, 4];
    const second = [1, 4, 9, 16];
    expect(correlation(first, second)).toBe(correlation(first, second, { mode: 'sample' }));
  });
});

// ---------------------------------------------------------------------------
// correlation — zero variance
// ---------------------------------------------------------------------------

describe('correlation — zero variance', () => {
  test('first가 상수면 RangeError', () => {
    expect(() => correlation([5, 5, 5], [1, 2, 3])).toThrow(RangeError);
  });

  test('second가 상수면 RangeError', () => {
    expect(() => correlation([1, 2, 3], [7, 7, 7])).toThrow(RangeError);
  });

  test('두 vector 모두 상수면 RangeError (first 검증이 먼저)', () => {
    expect(() => correlation([5, 5, 5], [7, 7, 7])).toThrow(RangeError);
  });

  test('단일 entry는 population mode에서도 zero variance → RangeError', () => {
    // length === 1: delta=0, squaredSum=0 → zero variance
    expect(() => correlation([5], [7])).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// correlation — covariance와 공유하는 validation
// ---------------------------------------------------------------------------

describe('correlation — invalid input (공유 validation)', () => {
  test('first가 non-array면 TypeError', () => {
    expect(() => correlation(null as unknown as readonly number[], [1, 2])).toThrow(TypeError);
  });

  test('second가 non-array면 TypeError', () => {
    expect(() => correlation([1, 2], undefined as unknown as readonly number[])).toThrow(TypeError);
  });

  test('길이가 다르면 RangeError', () => {
    expect(() => correlation([1, 2], [1, 2, 3])).toThrow(RangeError);
  });

  test('빈 배열은 RangeError', () => {
    expect(() => correlation([], [])).toThrow(RangeError);
  });

  test('sample mode에서 length === 1은 RangeError', () => {
    expect(() => correlation([1], [2], { mode: 'sample' })).toThrow(RangeError);
  });

  test('invalid mode는 RangeError', () => {
    expect(() => correlation([1, 2], [3, 4], { mode: 'bad' as never })).toThrow(RangeError);
  });

  test('first에 NaN은 RangeError', () => {
    expect(() => correlation([1, Number.NaN], [3, 4])).toThrow(RangeError);
  });

  test('second에 Infinity는 RangeError', () => {
    expect(() => correlation([1, 2], [3, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });

  test('first sum overflow는 RangeError', () => {
    expect(() => correlation([Number.MAX_VALUE, Number.MAX_VALUE], [1, 2])).toThrow(RangeError);
  });

  test('squared delta overflow는 RangeError', () => {
    expect(() => correlation([Number.MAX_VALUE, -Number.MAX_VALUE], [1, -1])).toThrow(RangeError);
  });
});
