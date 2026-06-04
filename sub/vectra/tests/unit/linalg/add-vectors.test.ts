/**
 * addVectors(Into) element-wise sum unit test.
 *
 * 정상값, out/input aliasing, 빈 vector, 길이 mismatch, non-finite,
 * capacity 부족, overflow, -0 canonicalize 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { addVectors } from '../../../src/linalg/add-vectors';
import { addVectorsInto } from '../../../src/linalg/add-vectors-into';

describe('addVectorsInto / addVectors — element-wise sum', () => {
  test('두 vector를 더해 out에 기록하고 out을 반환한다', () => {
    const out = [0, 0, 0];
    const result = addVectorsInto(out, [1, 2, 3], [4, 5, 6]);
    expect(result).toBe(out);
    expect(out).toEqual([5, 7, 9]);
  });

  test('allocating companion은 새 number[]를 반환한다', () => {
    expect(addVectors([1, 2], [3, 4])).toEqual([4, 6]);
  });

  test('빈 vector 쌍은 빈 vector를 기록한다', () => {
    const out = [9, 9];
    addVectorsInto(out, [], []);
    expect(out).toEqual([]);
    expect(addVectors([], [])).toEqual([]);
  });

  test('out/input aliasing을 허용한다', () => {
    const a = [1, 2, 3];
    addVectorsInto(a, a, [4, 5, 6]);
    expect(a).toEqual([5, 7, 9]);
  });

  test('길이 mismatch, non-finite, capacity 부족, overflow는 RangeError이고 out은 미수정이다', () => {
    const out = [9, 9];
    expect(() => addVectorsInto(out, [1, 2], [1])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
    expect(() => addVectorsInto(out, [1, Number.NaN], [1, 2])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
    expect(() => addVectorsInto([9], [1, 2], [3, 4])).toThrow(RangeError);
    expect(() => addVectorsInto(out, [Number.MAX_VALUE, Number.MAX_VALUE], [Number.MAX_VALUE, 1])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('결과 -0은 0으로 canonicalize한다', () => {
    const out = [9];
    addVectorsInto(out, [-0], [0]);
    expect(Object.is(out[0], -0)).toBe(false);
  });
});
