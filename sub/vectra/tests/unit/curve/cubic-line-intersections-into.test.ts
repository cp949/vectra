/**
 * cubicLineIntersectionsInto 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { cubicLineIntersectionsInto } from '../../../src/curve/cubic-line-intersections-into';
import type { IntersectionHit } from '../../../src/types';

describe('cubicLineIntersectionsInto', () => {
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

describe('cubicLineIntersectionsInto 좌표 scale 불변성', () => {
  const SCALES = [1e-12, 1e-8, 1e-4, 1, 1e4, 1e8];

  /**
   * 기준 좌표를 s배 한 cubic과 line으로 교차를 구한다.
   * epsilon도 같이 s배 해 같은 기하 문제를 만든다.
   */
  function intersectScaled(
    points: readonly [number, number][],
    origin: [number, number],
    s: number
  ): IntersectionHit[] {
    const [p0, p1, p2, p3] = points.map(([x, y]) => ({ x: x * s, y: y * s }));
    const hits: IntersectionHit[] = [];
    cubicLineIntersectionsInto(
      hits,
      p0,
      p1,
      p2,
      p3,
      { origin: { x: origin[0] * s, y: origin[1] * s }, direction: { x: 1, y: 0 } },
      { epsilon: 1e-9 * s }
    );
    return [...hits].sort((a, b) => a.tB - b.tB);
  }

  test('직선 위에서 1e-6만큼 휜 cubic은 모든 scale에서 hit 3건이다', () => {
    // 양 끝은 직선 위(touch), t=0.5에서 직선을 가로지른다(cross).
    for (const s of SCALES) {
      const hits = intersectScaled(
        [
          [0, 0],
          [1, 1e-6],
          [2, -1e-6],
          [3, 0],
        ],
        [0, 0],
        s
      );
      expect(
        hits.map((h) => h.kind),
        `s=${s}`
      ).toEqual(['touch', 'cross', 'touch']);
      expect(hits[1].tB, `s=${s}`).toBeCloseTo(0.5, 9);
    }
  });

  test('꼭짓점이 직선에 닿는 cubic은 모든 scale에서 touch 1건이다', () => {
    for (const s of SCALES) {
      const hits = intersectScaled(
        [
          [0, 0],
          [1, 1],
          [2, 1],
          [3, 0],
        ],
        [0, 0.75],
        s
      );
      expect(
        hits.map((h) => h.kind),
        `s=${s}`
      ).toEqual(['touch']);
      expect(hits[0].tB, `s=${s}`).toBeCloseTo(0.5, 6);
    }
  });

  test('direction 벡터 길이가 달라도 epsilon 이내 끝점은 touch 1건이다', () => {
    // 시작점이 직선 y=0에서 5e-10 떨어져 있다. 기본 epsilon 1e-9 이내다.
    for (const length of [1e-3, 1, 1e3]) {
      const hits: IntersectionHit[] = [];
      cubicLineIntersectionsInto(
        hits,
        { x: 0, y: 5e-10 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 2 },
        { origin: { x: 0, y: 0 }, direction: { x: length, y: 0 } }
      );
      expect(
        hits.map((h) => [h.kind, h.tB]),
        `length=${length}`
      ).toEqual([['touch', 0]]);
    }
  });
});
