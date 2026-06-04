/**
 * squaredDistance squared Euclidean distance unit test.
 *
 * 정상값, 빈 vector, 누적 합 overflow RangeError, non-finite entry 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { squaredDistance } from '../../../src/linalg/squared-distance';

describe('squaredDistance — N-dimensional squared Euclidean distance', () => {
  test('a=[1,2,3], b=[4,6,3] 사이의 squared distance는 25이다', () => {
    expect(squaredDistance([1, 2, 3], [4, 6, 3])).toBe(25);
  });

  test('빈 vector 쌍의 squaredDistance는 0이다', () => {
    expect(squaredDistance([], [])).toBe(0);
  });

  test('누적 합 overflow는 RangeError', () => {
    expect(() => squaredDistance([Number.MAX_VALUE], [0])).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => squaredDistance([1, Number.NaN], [1, 2])).toThrow(RangeError);
  });
});
