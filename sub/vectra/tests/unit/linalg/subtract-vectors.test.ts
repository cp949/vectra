/**
 * subtractVectors(Into) element-wise difference unit test.
 *
 * 정상값, out/input aliasing, 길이 mismatch, non-finite,
 * capacity 부족, overflow 정책을 고정한다.
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
});
