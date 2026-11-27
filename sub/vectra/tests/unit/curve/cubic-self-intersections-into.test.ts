/**
 * cubicSelfIntersectionsInto 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { cubicSelfIntersectionsInto } from '../../../src/curve/cubic-self-intersections-into';
import type { IntersectionHit } from '../../../src/types';

describe('cubicSelfIntersectionsInto', () => {
  test('loop cubic이 자기 교차점을 반환한다', () => {
    // p0=(0,0), p1=(2,2), p2=(-2,2), p3=(2,0) — loop 형태
    // 자기 교차점: tA≈0.173, tB≈0.827, 위치 ≈(0.572, 0.858)
    const hits: IntersectionHit[] = [];
    cubicSelfIntersectionsInto(hits, { kind: 'cubic', x0: 0, y0: 0, x1: 2, y1: 2, x2: -2, y2: 2, x3: 2, y3: 0 });
    expect(hits.length).toBeGreaterThanOrEqual(1);
    for (const h of hits) {
      expect(h.tA).toBeLessThan(0.45);
      expect(h.tB).toBeGreaterThan(0.55);
    }
    const h0 = hits[0];
    expect(Number.isFinite(h0.point.x)).toBe(true);
    expect(Number.isFinite(h0.point.y)).toBe(true);
    expect(h0.point.x).toBeCloseTo(0.572, 1);
    expect(h0.point.y).toBeCloseTo(0.858, 1);
  });

  test('S-curve(단조 cubic)는 자기 교차점이 없다', () => {
    // S-curve: p0=(0,0), p1=(1,2), p2=(2,-2), p3=(3,0) — loop 없음
    const hits: IntersectionHit[] = [];
    cubicSelfIntersectionsInto(hits, { kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 2, x2: 2, y2: -2, x3: 3, y3: 0 });
    expect(hits).toHaveLength(0);
  });

  test('단순 cubic (볼록)는 자기 교차점이 없다', () => {
    const hits: IntersectionHit[] = [];
    cubicSelfIntersectionsInto(hits, { kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 1, x2: 2, y2: 1, x3: 3, y3: 0 });
    expect(hits).toHaveLength(0);
  });

  test('outHits가 미리 채워져 있어도 length=0에서 시작한다', () => {
    const hits: IntersectionHit[] = [{ point: { x: 99, y: 99 }, kind: 'cross', tA: 0, tB: 0 }];
    cubicSelfIntersectionsInto(hits, { kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 1, x2: 2, y2: 1, x3: 3, y3: 0 });
    expect(hits).toHaveLength(0);
  });
});
