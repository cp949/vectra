/**
 * pNorm generalized p-norm unit test.
 *
 * p=1 sumNorm 동치, p=2 euclideanNorm 동치, p=4 표준값, 빈·zero vector,
 * huge magnitude scaling, p < 1 / p = 0 / p = NaN / p = Infinity RangeError,
 * non-finite entry 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { euclideanNorm } from '../../../src/linalg/euclidean-norm';
import { pNorm } from '../../../src/linalg/p-norm';
import { sumNorm } from '../../../src/linalg/sum-norm';

describe('pNorm — generalized p-norm', () => {
  test('p = 1이면 sumNorm과 같다', () => {
    const v = [1, -2, 3, -4];
    expect(pNorm(v, 1)).toBeCloseTo(sumNorm(v), 12);
  });

  test('p = 2이면 euclideanNorm과 가깝다', () => {
    const v = [3, 4];
    expect(pNorm(v, 2)).toBeCloseTo(euclideanNorm(v), 12);
  });

  test('p = 4의 표준값을 계산한다', () => {
    expect(pNorm([1, 1, 1, 1], 4)).toBeCloseTo(4 ** 0.25, 12);
  });

  test('빈 vector는 0을 반환한다', () => {
    expect(pNorm([], 2)).toBe(0);
  });

  test('zero vector는 0을 반환한다', () => {
    expect(pNorm([0, 0, 0], 3)).toBe(0);
  });

  test('huge magnitude 입력도 scaling loop로 finite 결과를 반환한다(단순 sum(|x|^p)는 overflow)', () => {
    const m = 1e200;
    const r = pNorm([m, m], 2);
    expect(Number.isFinite(r)).toBe(true);
    expect(r / m).toBeCloseTo(Math.SQRT2, 12);
  });

  test('p < 1은 RangeError', () => {
    expect(() => pNorm([1, 2], 0.5)).toThrow(RangeError);
  });

  test('p = 0은 RangeError', () => {
    expect(() => pNorm([1, 2], 0)).toThrow(RangeError);
  });

  test('p = NaN은 RangeError', () => {
    expect(() => pNorm([1, 2], Number.NaN)).toThrow(RangeError);
  });

  test('p = Infinity는 RangeError(supremumNorm을 사용한다)', () => {
    expect(() => pNorm([1, 2], Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => pNorm([1, Number.NaN], 2)).toThrow(RangeError);
  });
});
