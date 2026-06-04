/**
 * statistics mahalanobisDistance — S9-RM-011 unit tests.
 */

import { describe, expect, test } from 'vitest';
import { mahalanobisDistance } from '../../../src/statistics/mahalanobis-distance';

// ---------------------------------------------------------------------------
// mahalanobisDistance
// ---------------------------------------------------------------------------

const identityCov2 = [
  [1, 0],
  [0, 1],
] as const;

describe('mahalanobisDistance — identity covariance', () => {
  test('identity cov에서 Euclidean distance와 일치', () => {
    expect(mahalanobisDistance([3, 4], [0, 0], identityCov2)).toBeCloseTo(5, 12);
    expect(
      mahalanobisDistance(
        [1, 2, 2],
        [0, 0, 0],
        [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ]
      )
    ).toBeCloseTo(3, 12);
  });

  test('같은 point/mean은 distance 0', () => {
    expect(mahalanobisDistance([1, 2], [1, 2], identityCov2)).toBe(0);
  });
});

describe('mahalanobisDistance — diagonal covariance', () => {
  test('축별 scale 반영', () => {
    // cov = diag(4, 9): variable 1은 std 2, variable 2는 std 3.
    // delta = [2, 3] → 정규화 거리 = sqrt(2^2 / 4 + 3^2 / 9) = sqrt(2)
    const cov = [
      [4, 0],
      [0, 9],
    ];
    expect(mahalanobisDistance([2, 3], [0, 0], cov)).toBeCloseTo(Math.sqrt(2), 12);
  });
});

describe('mahalanobisDistance — invalid input', () => {
  test('point/mean length mismatch는 RangeError', () => {
    expect(() => mahalanobisDistance([1, 2], [1], identityCov2)).toThrow(RangeError);
  });

  test('covariance 크기 mismatch는 RangeError', () => {
    expect(() => mahalanobisDistance([1, 2, 3], [0, 0, 0], identityCov2)).toThrow(RangeError);
  });

  test('non-square covariance는 RangeError', () => {
    expect(() =>
      mahalanobisDistance(
        [1, 2],
        [0, 0],
        [
          [1, 0, 0],
          [0, 1, 0],
        ]
      )
    ).toThrow(RangeError);
  });

  test('ragged covariance는 RangeError', () => {
    expect(() =>
      mahalanobisDistance([1, 2], [0, 0], [
        [1, 0],
        [0, 1, 0] as unknown as readonly number[],
      ] as unknown as readonly (readonly number[])[])
    ).toThrow(RangeError);
  });

  test('non-symmetric covariance는 RangeError', () => {
    expect(() =>
      mahalanobisDistance(
        [1, 2],
        [0, 0],
        [
          [1, 0.5],
          [-0.5, 1],
        ]
      )
    ).toThrow(RangeError);
  });

  test('singular covariance(zero diagonal)는 RangeError', () => {
    expect(() =>
      mahalanobisDistance(
        [1, 2],
        [0, 0],
        [
          [1, 1],
          [1, 1],
        ]
      )
    ).toThrow(RangeError);
  });

  test('negative-definite covariance는 RangeError', () => {
    expect(() => mahalanobisDistance([1], [0], [[-1]])).toThrow(RangeError);
  });

  test('point entry non-finite는 RangeError', () => {
    expect(() => mahalanobisDistance([Number.NaN, 0], [0, 0], identityCov2)).toThrow(RangeError);
  });

  test('mean entry non-finite는 RangeError', () => {
    expect(() => mahalanobisDistance([1, 2], [Number.POSITIVE_INFINITY, 0], identityCov2)).toThrow(RangeError);
  });

  test('covariance entry non-finite는 RangeError', () => {
    expect(() =>
      mahalanobisDistance(
        [1, 2],
        [0, 0],
        [
          [1, Number.NaN],
          [Number.NaN, 1],
        ]
      )
    ).toThrow(RangeError);
  });

  test('point가 array가 아니면 TypeError', () => {
    expect(() => mahalanobisDistance(null as unknown as readonly number[], [0, 0], identityCov2)).toThrow(TypeError);
  });

  test('epsilon 옵션이 음수면 RangeError', () => {
    expect(() => mahalanobisDistance([1, 2], [0, 0], identityCov2, { epsilon: -1 })).toThrow(RangeError);
  });

  test('빈 vector + 0x0 covariance는 distance 0', () => {
    expect(mahalanobisDistance([], [], [])).toBe(0);
  });
});
