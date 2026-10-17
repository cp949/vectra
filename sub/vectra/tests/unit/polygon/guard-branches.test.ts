/**
 * polygon 가장자리 순회와 정렬의 degenerate 경계 테스트.
 *
 * 첫 edge가 zero-length이면 첫 sample은 그 vertex 그대로다. 빈 ring에는 zero-length edge가 없다.
 * NaN angle point가 중간에 있어도 finite angle point 뒤로 밀려난다.
 */

import { describe, expect, test } from 'vitest';
import { pointsAlongEdgesInto } from '../../../src/polygon/points-along-edges-into';
import { ringHasZeroLengthEdge } from '../../../src/polygon/self-intersection.internal';
import { sortPointsByAngleInto } from '../../../src/polygon/sort-points-by-angle-into';

describe('pointsAlongEdgesInto', () => {
  test('첫 edge가 zero-length이면 첫 sample은 그 vertex다', () => {
    const out = pointsAlongEdgesInto(
      [],
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      10
    );
    // 둘레 10 + 10 + 14.14... 에서 dist 0, 10, 20 순서로 sample한다.
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[1]).toEqual({ x: 10, y: 0 });
    expect(out[2]).toEqual({ x: 10, y: 10 });
  });
});

describe('ringHasZeroLengthEdge', () => {
  test('빈 ring은 zero-length edge가 없다', () => {
    expect(ringHasZeroLengthEdge([], 1e-9)).toBe(false);
  });
});

describe('sortPointsByAngleInto', () => {
  test('NaN angle point가 중간에 있어도 finite angle point 뒤로 보낸다', () => {
    const out = sortPointsByAngleInto(
      [],
      [
        { x: 0, y: 1 },
        { x: Number.NaN, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: 0 },
      ],
      { center: { x: 0, y: 0 } }
    );
    expect(out.map((p) => p.x)).toEqual([1, 0, -1, Number.NaN]);
  });
});
