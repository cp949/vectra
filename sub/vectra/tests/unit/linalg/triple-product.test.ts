/**
 * tripleProduct scalar triple product unit test.
 *
 * 정상값, cyclic permutation 부호 보존, 동일 vector 쌍 zero,
 * 입력 길이 3 제약, non-finite entry 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { tripleProduct } from '../../../src/linalg/triple-product';

describe('tripleProduct — scalar triple product (a × b) · c', () => {
  test('standard basis 세 벡터의 triple product는 1이다', () => {
    expect(tripleProduct([1, 0, 0], [0, 1, 0], [0, 0, 1])).toBe(1);
  });

  test('cyclic permutation은 부호를 보존한다', () => {
    const abc = tripleProduct([1, 2, 3], [4, 5, 6], [7, 8, 10]);
    const bca = tripleProduct([4, 5, 6], [7, 8, 10], [1, 2, 3]);
    const cab = tripleProduct([7, 8, 10], [1, 2, 3], [4, 5, 6]);
    expect(bca).toBeCloseTo(abc, 12);
    expect(cab).toBeCloseTo(abc, 12);
  });

  test('전치한 두 vector가 같으면 triple product는 0이다', () => {
    expect(tripleProduct([1, 2, 3], [1, 2, 3], [4, 5, 6])).toBe(0);
  });

  test('입력 길이가 3이 아니면 RangeError', () => {
    expect(() => tripleProduct([1, 2], [1, 2, 3], [1, 2, 3])).toThrow(RangeError);
    expect(() => tripleProduct([1, 2, 3], [1, 2], [1, 2, 3])).toThrow(RangeError);
    expect(() => tripleProduct([1, 2, 3], [1, 2, 3], [1, 2])).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => tripleProduct([1, 2, Number.NaN], [1, 2, 3], [1, 2, 3])).toThrow(RangeError);
  });
});
