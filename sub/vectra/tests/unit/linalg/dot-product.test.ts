/**
 * dotProduct vector dot product unit test.
 *
 * 정상값, 빈 vector, 길이 mismatch, non-finite entry 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { dotProduct } from '../../../src/linalg/dot-product';

describe('dotProduct — vector dot product', () => {
  test('표준 길이 3 벡터의 dot product를 계산한다', () => {
    expect(dotProduct([1, 2, 3], [4, 5, 6])).toBe(32);
  });

  test('빈 vector 쌍은 0을 반환한다', () => {
    expect(dotProduct([], [])).toBe(0);
  });

  test('서로 길이가 다르면 RangeError를 던진다', () => {
    expect(() => dotProduct([1, 2], [1, 2, 3])).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError를 던진다', () => {
    expect(() => dotProduct([1, Number.NaN], [1, 2])).toThrow(RangeError);
    expect(() => dotProduct([1, 2], [1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });
});
