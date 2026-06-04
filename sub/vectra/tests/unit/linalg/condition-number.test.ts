import { describe, expect, test } from 'vitest';
import { conditionNumber } from '../../../src/linalg/condition-number';

describe('conditionNumber — full-rank ratio', () => {
  test('identity matrix는 condition number 1', () => {
    expect(conditionNumber([[1]])).toBeCloseTo(1, 10);
    expect(
      conditionNumber([
        [1, 0],
        [0, 1],
      ])
    ).toBeCloseTo(1, 10);
    expect(
      conditionNumber([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ])
    ).toBeCloseTo(1, 10);
  });

  test('diagonal matrix는 |max diag| / |min diag| 비율을 반환한다', () => {
    // singular values는 |diagonal|이다.
    const result = conditionNumber([
      [4, 0],
      [0, 1],
    ]);
    expect(result).toBeCloseTo(4, 10);
  });

  test('diagonal matrix(음수 포함)는 절댓값 비율을 반환한다', () => {
    const result = conditionNumber([
      [-3, 0],
      [0, 1],
    ]);
    expect(result).toBeCloseTo(3, 10);
  });

  test('rectangular full-rank tall matrix는 singular value ratio', () => {
    // [[1,0],[0,1],[1,1]] → sigma_max = sqrt((3+sqrt(5))/2), sigma_min = sqrt((3-sqrt(5))/2).
    // ratio = (1 + sqrt(5)) / 2 * sqrt 표현 — 직접 계산해 비교한다.
    const A = [
      [1, 0],
      [0, 1],
      [1, 1],
    ];
    const result = conditionNumber(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    // A^T A = [[2,1],[1,2]]. eigenvalues = 3, 1. sigma = sqrt(3), 1. ratio = sqrt(3).
    expect(result).toBeCloseTo(Math.sqrt(3), 10);
  });

  test('rectangular full-rank wide matrix도 singular value ratio', () => {
    const A = [
      [1, 0, 1],
      [0, 1, 1],
    ];
    const result = conditionNumber(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    // A A^T = [[2,1],[1,2]]. eigenvalues = 3, 1. sigma = sqrt(3), 1. ratio = sqrt(3).
    expect(result).toBeCloseTo(Math.sqrt(3), 10);
  });
});

describe('conditionNumber — rank-deficient / zero / empty', () => {
  test('rank-deficient matrix는 Infinity', () => {
    const A = [
      [1, 2, 3],
      [2, 4, 6],
    ];
    expect(conditionNumber(A)).toBe(Number.POSITIVE_INFINITY);
  });

  test('zero matrix는 Infinity', () => {
    expect(
      conditionNumber([
        [0, 0],
        [0, 0],
      ])
    ).toBe(Number.POSITIVE_INFINITY);
  });

  test('빈 matrix []는 1', () => {
    expect(conditionNumber([])).toBe(1);
  });
});

describe('conditionNumber — SVD failure / invalid input', () => {
  test('maxIterations 1은 미수렴으로 undefined', () => {
    const A = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10],
    ];
    expect(conditionNumber(A, { maxIterations: 1 })).toBeUndefined();
  });

  test('invalid options는 RangeError', () => {
    expect(() => conditionNumber([[1]], { maxIterations: 0 })).toThrow(RangeError);
    expect(() => conditionNumber([[1]], { tolerance: -1 })).toThrow(RangeError);
    expect(() => conditionNumber([[1]], { epsilon: Number.NaN })).toThrow(RangeError);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() => conditionNumber([[1, 2], [3]])).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => conditionNumber([[Number.NaN]])).toThrow(RangeError);
    expect(() => conditionNumber([[Number.POSITIVE_INFINITY]])).toThrow(RangeError);
    expect(() => conditionNumber([[Number.NEGATIVE_INFINITY]])).toThrow(RangeError);
  });

  test('one-sided zero shape [[]]는 RangeError', () => {
    expect(() => conditionNumber([[]])).toThrow(RangeError);
  });
});

describe('conditionNumber — overflow boundary', () => {
  test('full-rank이지만 sigma_max / sigma_min이 Infinity로 overflow하면 RangeError', () => {
    // epsilon=0이면 sigma_min(~1e-160)가 rank-deficient 분기에 잡히지 않는다.
    // A^T A diag = [1e308, ~1e-320]은 float64 범위 내(MIN_NORMAL=2.2e-308 미만의 subnormal).
    // ratio = 1e154 / 1e-160 ≈ 1e314 → +Infinity.
    const A = [
      [1e154, 0],
      [0, 1e-160],
    ];
    expect(() => conditionNumber(A, { epsilon: 0 })).toThrow(RangeError);
    expect(() => conditionNumber(A, { epsilon: 0 })).toThrow(/non-finite/);
  });
});
