/**
 * sumNorm ℓ1 norm unit test.
 *
 * 정상값, 빈 vector, non-finite entry, 누적 합 overflow RangeError 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { sumNorm } from '../../../src/linalg/sum-norm';

describe('sumNorm — ℓ1 norm', () => {
  test('부호 섞인 vector의 absolute value 합을 반환한다', () => {
    expect(sumNorm([1, -2, 3, -4])).toBe(10);
  });

  test('빈 vector는 0을 반환한다', () => {
    expect(sumNorm([])).toBe(0);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => sumNorm([1, Number.NaN])).toThrow(RangeError);
  });

  test('누적 합이 Infinity로 overflow되면 RangeError', () => {
    expect(() => sumNorm([Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
  });
});
