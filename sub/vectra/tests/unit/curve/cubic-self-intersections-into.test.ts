/**
 * cubicSelfIntersectionsInto 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { cubicSelfIntersectionsInto } from '../../../src/curve/cubic-self-intersections-into';
import type { IntersectionHit } from '../../../src/types';

describe('cubicSelfIntersectionsInto', () => {
  test('함수가 존재한다', () => {
    expect(typeof cubicSelfIntersectionsInto).toBe('function');
  });

  test('loop cubic이 자기 교차점을 반환한다', () => {
    // p0=(0,0), p1=(2,2), p2=(-2,2), p3=(2,0) — loop 형태
    // 자기 교차점: tA≈0.173, tB≈0.827, 위치 ≈(0.572, 0.858)
    const hits: IntersectionHit[] = [];
    cubicSelfIntersectionsInto(hits, { x: 0, y: 0 }, { x: 2, y: 2 }, { x: -2, y: 2 }, { x: 2, y: 0 });
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
    cubicSelfIntersectionsInto(hits, { x: 0, y: 0 }, { x: 1, y: 2 }, { x: 2, y: -2 }, { x: 3, y: 0 });
    expect(hits).toHaveLength(0);
  });

  test('단순 cubic (볼록)는 자기 교차점이 없다', () => {
    const hits: IntersectionHit[] = [];
    cubicSelfIntersectionsInto(hits, { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 0 });
    expect(hits).toHaveLength(0);
  });

  test('outHits가 미리 채워져 있어도 length=0에서 시작한다', () => {
    const hits: IntersectionHit[] = [{ point: { x: 99, y: 99 }, kind: 'cross', tA: 0, tB: 0 }];
    cubicSelfIntersectionsInto(hits, { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 0 });
    expect(hits).toHaveLength(0);
  });
});
