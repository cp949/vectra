/**
 * combineVectors(Into) callback composition unit test.
 *
 * 정상값, index 전달, callback throw, non-finite result,
 * 길이 mismatch, capacity 부족 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { combineVectors } from '../../../src/linalg/combine-vectors';
import { combineVectorsInto } from '../../../src/linalg/combine-vectors-into';

describe('combineVectorsInto / combineVectors — callback composition', () => {
  test('callback 결과를 out에 기록하고 index를 전달한다', () => {
    const out = [0, 0, 0];
    combineVectorsInto(out, [1, 2, 3], [4, 5, 6], (a, b, i) => a + b + i);
    expect(out).toEqual([5, 8, 11]);
    expect(combineVectors([1, 2], [3, 4], (a, b) => a * b)).toEqual([3, 8]);
  });

  test('callback throw와 non-finite result는 out을 수정하지 않는다', () => {
    const out = [9, 9];
    expect(() =>
      combineVectorsInto(out, [1, 2], [3, 4], () => {
        throw new Error('boom');
      })
    ).toThrow('boom');
    expect(out).toEqual([9, 9]);
    expect(() => combineVectorsInto(out, [1, 2], [3, 4], () => Number.NaN)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('길이 mismatch와 capacity 부족은 RangeError이다', () => {
    expect(() => combineVectorsInto([], [1, 2], [1], (a, b) => a + b)).toThrow(RangeError);
    expect(() => combineVectorsInto([9], [1, 2], [3, 4], (a, b) => a + b)).toThrow(RangeError);
  });
});
