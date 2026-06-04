/**
 * chebyshevDistance Chebyshev distance unit test.
 *
 * 정상값, 빈 vector, non-finite difference RangeError 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { chebyshevDistance } from '../../../src/linalg/chebyshev-distance';

describe('chebyshevDistance — N-dimensional Chebyshev distance', () => {
  test('a=[1,2,3], b=[4,6,3] 사이의 Chebyshev distance는 4이다', () => {
    expect(chebyshevDistance([1, 2, 3], [4, 6, 3])).toBe(4);
  });

  test('빈 vector 쌍의 chebyshevDistance는 0이다', () => {
    expect(chebyshevDistance([], [])).toBe(0);
  });

  test('non-finite difference는 RangeError', () => {
    expect(() => chebyshevDistance([Number.MAX_VALUE], [-Number.MAX_VALUE])).toThrow(RangeError);
  });
});
