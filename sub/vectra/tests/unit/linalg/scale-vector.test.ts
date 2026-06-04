/**
 * scaleVector(Into) scalar multiply unit test.
 *
 * 정상값, out/vector aliasing, non-finite scalar/entry,
 * capacity 부족, overflow 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { scaleVector } from '../../../src/linalg/scale-vector';
import { scaleVectorInto } from '../../../src/linalg/scale-vector-into';

describe('scaleVectorInto / scaleVector — scalar multiply', () => {
  test('vector를 scalar로 곱한다', () => {
    const out = [0, 0, 0];
    scaleVectorInto(out, [1, -2, 3], 2);
    expect(out).toEqual([2, -4, 6]);
    expect(scaleVector([1, 2], 3)).toEqual([3, 6]);
  });

  test('out/vector aliasing을 허용한다', () => {
    const vector = [1, 2, 3];
    scaleVectorInto(vector, vector, 2);
    expect(vector).toEqual([2, 4, 6]);
  });

  test('non-finite scalar/entry, capacity 부족, overflow는 RangeError이고 out은 미수정이다', () => {
    const out = [9, 9];
    expect(() => scaleVectorInto(out, [1, 2], Number.NaN)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
    expect(() => scaleVectorInto(out, [1, Number.NaN], 2)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
    expect(() => scaleVectorInto([9], [1, 2], 2)).toThrow(RangeError);
    expect(() => scaleVectorInto(out, [Number.MAX_VALUE], 2)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });
});
