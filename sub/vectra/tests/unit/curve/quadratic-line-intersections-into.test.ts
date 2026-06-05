/**
 * quadraticLineIntersectionsInto 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { quadraticLineIntersectionsInto } from '../../../src/curve/quadratic-line-intersections-into';
import type { IntersectionHit } from '../../../src/types';

describe('quadraticLineIntersectionsInto', () => {
  test('대칭 quadratic이 horizontal line과 두 점에서 cross 교차한다', () => {
    // p0=(0,0), p1=(0.5,2), p2=(1,0), y=0.5 line
    // y(t)=4t(1-t) → 8t²-8t+1=0, 판별식 32>0 → 두 실근
    const hits: IntersectionHit[] = [];
    quadraticLineIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 0.5, y: 2 },
      { x: 1, y: 0 },
      { origin: { x: 0, y: 0.5 }, direction: { x: 1, y: 0 } }
    );
    expect(hits).toHaveLength(2);
    expect(hits[0].kind).toBe('cross');
    expect(hits[1].kind).toBe('cross');
    expect(hits[0].tB).toBeGreaterThan(0);
    expect(hits[0].tB).toBeLessThan(1);
    expect(hits[1].tB).toBeGreaterThan(0);
    expect(hits[1].tB).toBeLessThan(1);
    expect(hits[0].point.y).toBeCloseTo(0.5, 9);
    expect(hits[1].point.y).toBeCloseTo(0.5, 9);
  });

  test('접선이 touch hit를 하나 반환한다', () => {
    // y(t)=(2t-1)² → 중근 t=0.5, y=0 → touch
    const hits: IntersectionHit[] = [];
    quadraticLineIntersectionsInto(
      hits,
      { x: 0, y: 1 },
      { x: 0.5, y: -1 },
      { x: 1, y: 1 },
      { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }
    );
    expect(hits).toHaveLength(1);
    expect(hits[0].kind).toBe('touch');
    expect(hits[0].tB).toBeCloseTo(0.5, 6);
    expect(hits[0].point.y).toBeCloseTo(0, 9);
  });

  test('line과 만나지 않으면 빈 배열을 반환한다', () => {
    // curve 전체가 y>0 영역에 있고, line은 y=-1
    const hits: IntersectionHit[] = [];
    quadraticLineIntersectionsInto(
      hits,
      { x: 0, y: 1 },
      { x: 0.5, y: 2 },
      { x: 1, y: 1 },
      { origin: { x: 0, y: -1 }, direction: { x: 1, y: 0 } }
    );
    expect(hits).toHaveLength(0);
  });

  test('tuple 형식의 line input을 읽는다', () => {
    const hits: IntersectionHit[] = [];
    quadraticLineIntersectionsInto(hits, { x: 0, y: 0 }, { x: 0.5, y: 2 }, { x: 1, y: 0 }, [
      [0, 0.5],
      [1, 0],
    ] as const);
    expect(hits).toHaveLength(2);
    expect(hits[0].point.y).toBeCloseTo(0.5, 9);
    expect(hits[1].point.y).toBeCloseTo(0.5, 9);
  });

  test('curve endpoint (tB=0)이 line 위에 놓이면 touch hit를 반환한다', () => {
    // p0=(0,0)이 y=0 line 위에 있다
    const hits: IntersectionHit[] = [];
    quadraticLineIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 0.5, y: 1 },
      { x: 1, y: 0.5 },
      { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }
    );
    const endpointHit = hits.find((h) => h.tB < 1e-6);
    expect(endpointHit).toBeDefined();
    expect(endpointHit?.kind).toBe('touch');
  });

  test('curve endpoint (tB=1)이 line 위에 놓이면 touch hit를 반환한다', () => {
    // p2=(1,0)이 y=0 line 위에 있다
    const hits: IntersectionHit[] = [];
    quadraticLineIntersectionsInto(
      hits,
      { x: 0, y: 0.5 },
      { x: 0.5, y: 1 },
      { x: 1, y: 0 },
      { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }
    );
    const endpointHit = hits.find((h) => h.tB > 1 - 1e-6);
    expect(endpointHit).toBeDefined();
    expect(endpointHit?.kind).toBe('touch');
  });

  test('zero-length direction은 빈 배열을 반환한다', () => {
    const hits: IntersectionHit[] = [];
    quadraticLineIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 0.5, y: 1 },
      { x: 1, y: 0 },
      { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } }
    );
    expect(hits).toHaveLength(0);
  });

  test('direction scale이 달라도 hit point와 tB는 동일하다', () => {
    // direction=(1,0) vs direction=(100,0)
    const hits1: IntersectionHit[] = [];
    const hits2: IntersectionHit[] = [];
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 0.5, y: 2 };
    const p2 = { x: 1, y: 0 };
    quadraticLineIntersectionsInto(hits1, p0, p1, p2, { origin: { x: 0, y: 0.5 }, direction: { x: 1, y: 0 } });
    quadraticLineIntersectionsInto(hits2, p0, p1, p2, { origin: { x: 0, y: 0.5 }, direction: { x: 100, y: 0 } });
    expect(hits1).toHaveLength(2);
    expect(hits2).toHaveLength(2);
    expect(hits1[0].tB).toBeCloseTo(hits2[0].tB, 9);
    expect(hits1[1].tB).toBeCloseTo(hits2[1].tB, 9);
    expect(hits1[0].point.x).toBeCloseTo(hits2[0].point.x, 9);
    expect(hits1[0].point.y).toBeCloseTo(hits2[0].point.y, 9);
  });
});
