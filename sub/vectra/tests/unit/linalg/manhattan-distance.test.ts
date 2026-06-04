/**
 * manhattanDistance Manhattan distance unit test.
 *
 * 정상값, 빈 vector, 누적 합 overflow RangeError, non-finite entry 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { manhattanDistance } from '../../../src/linalg/manhattan-distance';

describe('manhattanDistance — N-dimensional Manhattan distance', () => {
  test('a=[1,2,3], b=[4,6,3] 사이의 Manhattan distance는 7이다', () => {
    expect(manhattanDistance([1, 2, 3], [4, 6, 3])).toBe(7);
  });

  test('빈 vector 쌍의 manhattanDistance는 0이다', () => {
    expect(manhattanDistance([], [])).toBe(0);
  });

  test('누적 합 overflow는 RangeError', () => {
    expect(() => manhattanDistance([Number.MAX_VALUE, Number.MAX_VALUE], [0, 0])).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => manhattanDistance([1, 2], [1, Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });
});
