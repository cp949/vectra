/**
 * euclideanNorm ℓ2 norm unit test.
 *
 * 정상값, 단위 벡터, 빈 vector, zero vector, huge magnitude scaling 정밀도,
 * non-finite entry 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { euclideanNorm } from '../../../src/linalg/euclidean-norm';

describe('euclideanNorm — ℓ2 norm', () => {
  test('3-4-5 직각삼각형 unit test로 5를 반환한다', () => {
    expect(euclideanNorm([3, 4])).toBe(5);
  });

  test('단위 벡터는 1을 반환한다', () => {
    expect(euclideanNorm([1, 0, 0])).toBe(1);
  });

  test('빈 vector는 0을 반환한다', () => {
    expect(euclideanNorm([])).toBe(0);
  });

  test('zero vector는 0을 반환한다', () => {
    expect(euclideanNorm([0, 0, 0])).toBe(0);
  });

  test('huge magnitude 입력도 scaling loop로 finite 결과를 반환한다(단순 sum(x²)는 overflow)', () => {
    const m = 1e200;
    const r = euclideanNorm([m, m]);
    expect(Number.isFinite(r)).toBe(true);
    expect(r / m).toBeCloseTo(Math.SQRT2, 12);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => euclideanNorm([1, Number.NaN])).toThrow(RangeError);
  });
});
