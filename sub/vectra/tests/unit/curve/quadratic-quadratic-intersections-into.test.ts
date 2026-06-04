/**
 * quadraticQuadraticIntersectionsInto 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { quadraticQuadraticIntersectionsInto } from '../../../src/curve/quadratic-quadratic-intersections-into';
import type { IntersectionHit } from '../../../src/types';

describe('quadraticQuadraticIntersectionsInto', () => {
  test('함수가 존재한다', () => {
    expect(typeof quadraticQuadraticIntersectionsInto).toBe('function');
  });

  test('X 형태로 교차하는 두 quadratic이 한 교차점을 반환한다', () => {
    // curve A: p0=(0,1), p1=(0.5,0.5), p2=(1,0) — 우하방
    // curve B: p0=(0,0), p1=(0.5,0.5), p2=(1,1) — 우상방, (0.5, 0.5)에서 교차
    const hits: IntersectionHit[] = [];
    quadraticQuadraticIntersectionsInto(
      hits,
      { x: 0, y: 1 },
      { x: 0.5, y: 0.5 },
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: 0.5, y: 0.5 },
      { x: 1, y: 1 }
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
    expect(hits[0].kind).toBe('cross');
    expect(Math.abs(hits[0].point.x - 0.5)).toBeLessThan(0.05);
    expect(Math.abs(hits[0].point.y - 0.5)).toBeLessThan(0.05);
  });

  test('단일 transversal 교차점을 중복 hit로 나누지 않는다', () => {
    const hits: IntersectionHit[] = [];
    quadraticQuadraticIntersectionsInto(
      hits,
      { x: 0, y: 1 },
      { x: 0.5, y: 0.5 },
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: 0.5, y: 0.5 },
      { x: 1, y: 1 }
    );
    expect(hits).toHaveLength(1);
    expect(hits[0].point.x).toBeCloseTo(0.5, 4);
    expect(hits[0].point.y).toBeCloseTo(0.5, 4);
  });

  test('겹치지 않는 두 quadratic은 빈 배열을 반환한다', () => {
    // curve A는 y > 2 영역, curve B는 y < 0 영역
    const hits: IntersectionHit[] = [];
    quadraticQuadraticIntersectionsInto(
      hits,
      { x: 0, y: 3 },
      { x: 0.5, y: 4 },
      { x: 1, y: 3 },
      { x: 0, y: -1 },
      { x: 0.5, y: -2 },
      { x: 1, y: -1 }
    );
    expect(hits).toHaveLength(0);
  });

  test('outHits가 호출 전 채워져 있어도 length=0에서 시작한다', () => {
    const hits: IntersectionHit[] = [{ point: { x: 99, y: 99 }, kind: 'cross', tA: 0, tB: 0 }];
    quadraticQuadraticIntersectionsInto(
      hits,
      { x: 0, y: 3 },
      { x: 0.5, y: 4 },
      { x: 1, y: 3 },
      { x: 0, y: -1 },
      { x: 0.5, y: -2 },
      { x: 1, y: -1 }
    );
    expect(hits).toHaveLength(0);
  });

  test('maxDepth=1이면 crude hit를 반환하거나 빈 배열이지만 crash가 없다', () => {
    const hits: IntersectionHit[] = [];
    quadraticQuadraticIntersectionsInto(
      hits,
      { x: 0, y: 1 },
      { x: 0.5, y: 0.5 },
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: 0.5, y: 0.5 },
      { x: 1, y: 1 },
      { maxDepth: 1 }
    );
    expect(Array.isArray(hits)).toBe(true);
    for (const h of hits) {
      expect(Number.isFinite(h.tA)).toBe(true);
      expect(Number.isFinite(h.tB)).toBe(true);
      expect(Number.isFinite(h.point.x)).toBe(true);
      expect(Number.isFinite(h.point.y)).toBe(true);
    }
  });
});
