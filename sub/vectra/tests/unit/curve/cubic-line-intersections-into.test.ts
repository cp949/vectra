/**
 * cubicLineIntersectionsInto 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { cubicLineIntersectionsInto } from '../../../src/curve/cubic-line-intersections-into';
import type { IntersectionHit } from '../../../src/types';

describe('cubicLineIntersectionsInto', () => {
  test('함수가 존재한다', () => {
    expect(typeof cubicLineIntersectionsInto).toBe('function');
  });

  test('horizontal line이 S-curve를 두 점 이상에서 교차한다', () => {
    // S-curve: p0=(0,0), p1=(2,3), p2=(-2,3), p3=(0,6), y=1.5 line
    const hits: IntersectionHit[] = [];
    cubicLineIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 2, y: 3 },
      { x: -2, y: 3 },
      { x: 0, y: 6 },
      { origin: { x: 0, y: 1.5 }, direction: { x: 1, y: 0 } }
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
    for (const h of hits) {
      expect(h.point.y).toBeCloseTo(1.5, 6);
    }
  });

  test('loop cubic이 y=0 line에서 세 점 교차한다', () => {
    // p0=p3=(0,0), y(t)=12t(1-t)(1-2t) → t=0, 0.5, 1에서 y=0
    const hits: IntersectionHit[] = [];
    cubicLineIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 0, y: 4 },
      { x: 0, y: -4 },
      { x: 0, y: 0 },
      { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }
    );
    expect(hits.length).toBe(3);
    for (const h of hits) {
      expect(h.point.y).toBeCloseTo(0, 9);
    }
  });

  test('line과 만나지 않으면 빈 배열을 반환한다', () => {
    // curve 전체가 y>0, line은 y=-1
    const hits: IntersectionHit[] = [];
    cubicLineIntersectionsInto(
      hits,
      { x: 0, y: 1 },
      { x: 0.3, y: 2 },
      { x: 0.7, y: 2 },
      { x: 1, y: 1 },
      { origin: { x: 0, y: -1 }, direction: { x: 1, y: 0 } }
    );
    expect(hits).toHaveLength(0);
  });

  test('curve endpoint (tB=0)이 line 위에 놓이면 touch hit를 반환한다', () => {
    // p0=(0,0)이 y=0 line 위
    const hits: IntersectionHit[] = [];
    cubicLineIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 0.3, y: 1 },
      { x: 0.7, y: 1 },
      { x: 1, y: 0.5 },
      { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }
    );
    const endpointHit = hits.find((h) => h.tB < 1e-6);
    expect(endpointHit).toBeDefined();
    expect(endpointHit?.kind).toBe('touch');
  });

  test('curve endpoint (tB=1)이 line 위에 놓이면 touch hit를 반환한다', () => {
    // p3=(1,0)이 y=0 line 위
    const hits: IntersectionHit[] = [];
    cubicLineIntersectionsInto(
      hits,
      { x: 0, y: 0.5 },
      { x: 0.3, y: 1 },
      { x: 0.7, y: 1 },
      { x: 1, y: 0 },
      { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }
    );
    const endpointHit = hits.find((h) => h.tB > 1 - 1e-6);
    expect(endpointHit).toBeDefined();
    expect(endpointHit?.kind).toBe('touch');
  });

  test('curve 전체가 line 위에 있으면 point hit로 반환하지 않는다', () => {
    const hits: IntersectionHit[] = [];
    cubicLineIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }
    );
    expect(hits).toHaveLength(0);
  });

  test('zero-length direction은 빈 배열을 반환한다', () => {
    const hits: IntersectionHit[] = [];
    cubicLineIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 0.3, y: 1 },
      { x: 0.7, y: 1 },
      { x: 1, y: 0 },
      { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } }
    );
    expect(hits).toHaveLength(0);
  });

  test('direction scale이 달라도 hit point와 tB는 동일하다', () => {
    const hits1: IntersectionHit[] = [];
    const hits2: IntersectionHit[] = [];
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 0.3, y: 2 };
    const p2 = { x: 0.7, y: 2 };
    const p3 = { x: 1, y: 0 };
    cubicLineIntersectionsInto(hits1, p0, p1, p2, p3, { origin: { x: 0, y: 1 }, direction: { x: 1, y: 0 } });
    cubicLineIntersectionsInto(hits2, p0, p1, p2, p3, { origin: { x: 0, y: 1 }, direction: { x: 50, y: 0 } });
    expect(hits1.length).toBe(hits2.length);
    for (let i = 0; i < hits1.length; i++) {
      expect(hits1[i].tB).toBeCloseTo(hits2[i].tB, 9);
      expect(hits1[i].point.x).toBeCloseTo(hits2[i].point.x, 9);
      expect(hits1[i].point.y).toBeCloseTo(hits2[i].point.y, 9);
    }
  });

  test('tuple line input을 읽는다', () => {
    const hits: IntersectionHit[] = [];
    cubicLineIntersectionsInto(hits, { x: 0, y: 0 }, { x: 0.3, y: 2 }, { x: 0.7, y: 2 }, { x: 1, y: 0 }, [
      [0, 1],
      [1, 0],
    ] as const);
    expect(hits.length).toBeGreaterThanOrEqual(1);
    for (const h of hits) {
      expect(h.point.y).toBeCloseTo(1, 6);
    }
  });
});
