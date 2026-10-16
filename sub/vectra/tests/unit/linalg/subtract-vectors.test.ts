/**
 * subtractVectors(Into) element-wise difference unit test.
 *
 * 정상값, out/input aliasing, 길이 mismatch, non-finite,
 * capacity 부족, overflow, -0 canonicalize 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { subtractVectors } from '../../../src/linalg/subtract-vectors';
import { subtractVectorsInto } from '../../../src/linalg/subtract-vectors-into';

describe('subtractVectorsInto / subtractVectors — element-wise difference', () => {
  test('두 vector 차이를 계산한다', () => {
    const out = [0, 0, 0];
    subtractVectorsInto(out, [5, 7, 9], [4, 5, 6]);
    expect(out).toEqual([1, 2, 3]);
    expect(subtractVectors([5, 7], [1, 2])).toEqual([4, 5]);
  });

  test('out/input aliasing을 허용한다', () => {
    const b = [4, 5, 6];
    subtractVectorsInto(b, [5, 7, 9], b);
    expect(b).toEqual([1, 2, 3]);
  });

  test('길이 mismatch, non-finite, capacity 부족, overflow는 RangeError이고 out은 미수정이다', () => {
    const out = [9, 9];
    expect(() => subtractVectorsInto(out, [1, 2], [1])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
    expect(() => subtractVectorsInto(out, [1, 2], [1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
    expect(() => subtractVectorsInto([9], [1, 2], [3, 4])).toThrow(RangeError);
    expect(() => subtractVectorsInto(out, [-Number.MAX_VALUE], [Number.MAX_VALUE])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('결과 -0은 0으로 canonicalize한다(Into, companion)', () => {
    // -0 - 0은 -0이다.
    expect(Object.is(-0 - 0, -0)).toBe(true);
    const out = [9, 9];
    subtractVectorsInto(out, [-0, 3], [0, 1]);
    expect(Object.is(out[0], -0)).toBe(false);
    expect(out).toEqual([0, 2]);

    const result = subtractVectors([-0, 3], [0, 1]);
    expect(Object.is(result[0], -0)).toBe(false);
    expect(result).toEqual([0, 2]);
  });
});
