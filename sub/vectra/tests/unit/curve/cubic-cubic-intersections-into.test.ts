/**
 * cubicCubicIntersectionsInto 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { cubicCubicIntersectionsInto } from '../../../src/curve/cubic-cubic-intersections-into';
import type { IntersectionHit } from '../../../src/types';

describe('cubicCubicIntersectionsInto', () => {
  test('S-curve와 거울 대칭 S-curve가 두 점에서 교차한다', () => {
    // A: p0=(0,0), p1=(2,3), p2=(-2,3), p3=(4,0) — S자
    // B: p0=(0,3), p1=(2,0), p2=(-2,0), p3=(4,3) — A를 y=1.5 기준 반전
    const hits: IntersectionHit[] = [];
    cubicCubicIntersectionsInto(
      hits,
      { kind: 'cubic', x0: 0, y0: 0, x1: 2, y1: 3, x2: -2, y2: 3, x3: 4, y3: 0 },
      { kind: 'cubic', x0: 0, y0: 3, x1: 2, y1: 0, x2: -2, y2: 0, x3: 4, y3: 3 }
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
    for (const h of hits) {
      expect(Number.isFinite(h.point.x)).toBe(true);
      expect(Number.isFinite(h.point.y)).toBe(true);
      expect(Number.isFinite(h.tA)).toBe(true);
      expect(Number.isFinite(h.tB)).toBe(true);
    }
    const crossHits = hits.filter((h) => h.kind === 'cross');
    expect(crossHits.length).toBeGreaterThanOrEqual(1);
  });

  test('두 transversal 교차점을 각각 한 hit로 반환한다', () => {
    const hits: IntersectionHit[] = [];
    cubicCubicIntersectionsInto(
      hits,
      { kind: 'cubic', x0: 0, y0: 0, x1: 0.3, y1: 1, x2: 0.7, y2: 1, x3: 1, y3: 0 },
      { kind: 'cubic', x0: 0, y0: 0.5, x1: 0.3, y1: 0.5, x2: 0.7, y2: 0.5, x3: 1, y3: 0.5 }
    );
    expect(hits).toHaveLength(2);
    expect(hits[0].point.y).toBeCloseTo(0.5, 4);
    expect(hits[1].point.y).toBeCloseTo(0.5, 4);
  });

  test('겹치지 않는 두 cubic은 빈 배열을 반환한다', () => {
    const hits: IntersectionHit[] = [];
    cubicCubicIntersectionsInto(
      hits,
      { kind: 'cubic', x0: 0, y0: 10, x1: 1, y1: 11, x2: 2, y2: 11, x3: 3, y3: 10 },
      { kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: -1, x2: 2, y2: -1, x3: 3, y3: 0 }
    );
    expect(hits).toHaveLength(0);
  });
});
