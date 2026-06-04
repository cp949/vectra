/**
 * crossProduct(Into) 3D cross product unit test.
 *
 * 정상값, anti-commutativity, parallel vector, out/a/b aliasing,
 * 입력 길이 3 제약, out capacity 부족 + 원자성, out truncate, non-finite entry 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { crossProduct } from '../../../src/linalg/cross-product';
import { crossProductInto } from '../../../src/linalg/cross-product-into';

describe('crossProductInto — 3D cross product (Into)', () => {
  test('표준 basis cross product를 계산한다', () => {
    const out: number[] = [0, 0, 0];
    crossProductInto(out, [1, 0, 0], [0, 1, 0]);
    expect(out).toEqual([0, 0, 1]);
  });

  test('crossProduct는 anti-commutative이다', () => {
    const ab: number[] = [0, 0, 0];
    const ba: number[] = [0, 0, 0];
    crossProductInto(ab, [1, 2, 3], [4, 5, 6]);
    crossProductInto(ba, [4, 5, 6], [1, 2, 3]);
    expect(ab.map((v) => -v)).toEqual(ba);
  });

  test('out이 a와 같은 array여도 안전하게 기록한다', () => {
    const a = [1, 2, 3];
    crossProductInto(a, a, [4, 5, 6]);
    expect(a).toEqual([2 * 6 - 3 * 5, 3 * 4 - 1 * 6, 1 * 5 - 2 * 4]);
  });

  test('out이 b와 같은 array여도 안전하게 기록한다', () => {
    const b = [4, 5, 6];
    crossProductInto(b, [1, 2, 3], b);
    expect(b).toEqual([2 * 6 - 3 * 5, 3 * 4 - 1 * 6, 1 * 5 - 2 * 4]);
  });

  test('입력 vector 길이가 3이 아니면 RangeError', () => {
    expect(() => crossProductInto([], [1, 2], [1, 2, 3])).toThrow(RangeError);
    expect(() => crossProductInto([], [1, 2, 3], [1, 2])).toThrow(RangeError);
  });

  test('out 길이가 3보다 작으면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out = [9];
    expect(() => crossProductInto(out, [1, 0, 0], [0, 1, 0])).toThrow(RangeError);
    expect(out).toEqual([9]);
  });

  test('out 길이가 3보다 크면 3으로 truncate한다', () => {
    const out = [9, 9, 9, 9, 9];
    crossProductInto(out, [1, 0, 0], [0, 1, 0]);
    expect(out).toEqual([0, 0, 1]);
  });

  test('non-finite entry는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out = [9, 9, 9];
    expect(() => crossProductInto(out, [1, 2, Number.NaN], [1, 2, 3])).toThrow(RangeError);
    expect(out).toEqual([9, 9, 9]);
  });
});

describe('crossProduct — 3D cross product (companion)', () => {
  test('새 길이 3 number[]을 반환한다', () => {
    expect(crossProduct([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
  });

  test('parallel vector pair는 zero vector를 반환한다', () => {
    expect(crossProduct([1, 2, 3], [2, 4, 6])).toEqual([0, 0, 0]);
  });

  test('입력 길이가 3이 아니면 RangeError', () => {
    expect(() => crossProduct([1, 2], [1, 2, 3])).toThrow(RangeError);
  });
});
