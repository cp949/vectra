/**
 * quadraticCubicIntersectionsInto 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { quadraticCubicIntersectionsInto } from '../../../src/curve/quadratic-cubic-intersections-into';
import type { IntersectionHit } from '../../../src/types';

describe('quadraticCubicIntersectionsInto', () => {
  test('함수가 존재한다', () => {
    expect(typeof quadraticCubicIntersectionsInto).toBe('function');
  });

  test('교차하는 quadratic과 cubic이 교차점을 반환한다', () => {
    // quadratic A: p0=(0,0), p1=(0.5,2), p2=(1,0) — 위로 볼록
    // cubic B: p0=(0,1), p1=(0.3,1), p2=(0.7,1), p3=(1,1) — y≈1 수평
    const hits: IntersectionHit[] = [];
    quadraticCubicIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 0.5, y: 2 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 0.3, y: 1 },
      { x: 0.7, y: 1 },
      { x: 1, y: 1 }
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
    for (const h of hits) {
      expect(Number.isFinite(h.tA)).toBe(true);
      expect(Number.isFinite(h.tB)).toBe(true);
      expect(Number.isFinite(h.point.x)).toBe(true);
      expect(Number.isFinite(h.point.y)).toBe(true);
    }
  });

  test('겹치지 않으면 빈 배열을 반환한다', () => {
    const hits: IntersectionHit[] = [];
    quadraticCubicIntersectionsInto(
      hits,
      { x: 0, y: 5 },
      { x: 0.5, y: 6 },
      { x: 1, y: 5 },
      { x: 0, y: 0 },
      { x: 0.3, y: 0 },
      { x: 0.7, y: 0 },
      { x: 1, y: 0 }
    );
    expect(hits).toHaveLength(0);
  });

  test('단일 tangent 교차점을 중복 hit로 나누지 않는다', () => {
    const hits: IntersectionHit[] = [];
    quadraticCubicIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 0.5, y: 2 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 0.3, y: 1 },
      { x: 0.7, y: 1 },
      { x: 1, y: 1 }
    );
    expect(hits).toHaveLength(1);
    expect(hits[0].kind).toBe('touch');
    expect(hits[0].point.x).toBeCloseTo(0.5, 4);
    expect(hits[0].point.y).toBeCloseTo(1, 4);
  });
});
