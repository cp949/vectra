/**
 * supremumNorm ℓ∞ norm unit test.
 *
 * 정상값, 빈 vector, zero vector, non-finite entry 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { supremumNorm } from '../../../src/linalg/supremum-norm';

describe('supremumNorm — ℓ∞ norm', () => {
  test('absolute value의 최댓값을 반환한다', () => {
    expect(supremumNorm([1, -5, 3, -2])).toBe(5);
  });

  test('빈 vector는 0을 반환한다', () => {
    expect(supremumNorm([])).toBe(0);
  });

  test('zero vector는 0을 반환한다', () => {
    expect(supremumNorm([0, 0, 0])).toBe(0);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => supremumNorm([1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });
});
