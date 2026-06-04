/**
 * hadamardProduct(Into) element-wise vector product unit test.
 *
 * 정상값, out/a/b aliasing, out capacity 부족 + 원자성, out truncate,
 * 길이 mismatch, non-finite entry 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { hadamardProduct } from '../../../src/linalg/hadamard-product';
import { hadamardProductInto } from '../../../src/linalg/hadamard-product-into';

describe('hadamardProductInto — element-wise product (Into)', () => {
  test('두 vector를 곱해 out에 기록하고 out을 반환한다', () => {
    const out: number[] = [0, 0, 0];
    const result = hadamardProductInto(out, [1, 2, 3], [4, 5, 6]);
    expect(result).toBe(out);
    expect(out).toEqual([4, 10, 18]);
  });

  test('out이 a와 같은 array여도 in-place로 안전하게 기록한다', () => {
    const a = [1, 2, 3];
    hadamardProductInto(a, a, [4, 5, 6]);
    expect(a).toEqual([4, 10, 18]);
  });

  test('out이 b와 같은 array여도 in-place로 안전하게 기록한다', () => {
    const b = [4, 5, 6];
    hadamardProductInto(b, [1, 2, 3], b);
    expect(b).toEqual([4, 10, 18]);
  });

  test('out 길이가 입력 vector 길이보다 작으면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out = [9];
    expect(() => hadamardProductInto(out, [1, 2, 3], [4, 5, 6])).toThrow(RangeError);
    expect(out).toEqual([9]);
  });

  test('out 길이가 입력보다 크면 vector 길이로 truncate한다', () => {
    const out = [9, 9, 9, 9, 9];
    hadamardProductInto(out, [1, 2, 3], [4, 5, 6]);
    expect(out).toEqual([4, 10, 18]);
  });

  test('서로 길이가 다른 입력은 RangeError', () => {
    expect(() => hadamardProductInto([], [1, 2], [1, 2, 3])).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out = [9, 9, 9];
    expect(() => hadamardProductInto(out, [1, Number.NaN, 3], [4, 5, 6])).toThrow(RangeError);
    expect(out).toEqual([9, 9, 9]);
  });
});

describe('hadamardProduct — element-wise product (companion)', () => {
  test('새 number[] 배열을 반환한다', () => {
    const r = hadamardProduct([1, 2, 3], [4, 5, 6]);
    expect(r).toEqual([4, 10, 18]);
  });

  test('빈 vector 쌍은 빈 배열을 반환한다', () => {
    expect(hadamardProduct([], [])).toEqual([]);
  });

  test('서로 길이가 다른 입력은 RangeError', () => {
    expect(() => hadamardProduct([1, 2], [1, 2, 3])).toThrow(RangeError);
  });
});
