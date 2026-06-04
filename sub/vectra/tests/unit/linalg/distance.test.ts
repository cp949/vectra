/**
 * distance Euclidean distance unit test.
 *
 * 정상값, 빈 vector, max-scaling overflow 방지, 길이 mismatch 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { distance } from '../../../src/linalg/distance';

describe('distance — N-dimensional Euclidean distance', () => {
  test('a=[1,2,3], b=[4,6,3] 사이의 Euclidean distance는 5이다', () => {
    expect(distance([1, 2, 3], [4, 6, 3])).toBe(5);
  });

  test('빈 vector 쌍의 distance는 0이다', () => {
    expect(distance([], [])).toBe(0);
  });

  test('max-scaling으로 큰 값 overflow를 피한다', () => {
    expect(distance([Number.MAX_VALUE], [0])).toBe(Number.MAX_VALUE);
  });

  test('길이 mismatch는 RangeError', () => {
    expect(() => distance([1], [1, 2])).toThrow(RangeError);
  });
});
