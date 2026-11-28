/**
 * line-family × Bezier curve intersection unit test.
 *
 * TASK-04: segment/ray/infinite-line × quadratic/cubic facade 검증.
 * tA range filtering이 올바르게 동작하는지 확인한다.
 */

import { describe, expect, test } from 'vitest';
import { infiniteLineCubicIntersectionsInto } from '../../../src/intersects/infinite-line-cubic-intersections-into';
import { infiniteLineQuadraticIntersectionsInto } from '../../../src/intersects/infinite-line-quadratic-intersections-into';
import { rayCubicIntersectionsInto } from '../../../src/intersects/ray-cubic-intersections-into';
import { rayQuadraticIntersectionsInto } from '../../../src/intersects/ray-quadratic-intersections-into';
import { segmentCubicIntersectionsInto } from '../../../src/intersects/segment-cubic-intersections-into';
import { segmentQuadraticIntersectionsInto } from '../../../src/intersects/segment-quadratic-intersections-into';
import type { IntersectionHit } from '../../../src/types';

// ─────────────────────────────────────────────────────────────────────────────
// segmentQuadraticIntersectionsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('segmentQuadraticIntersectionsInto', () => {
  test('segment range 내 hit만 반환한다', () => {
    // quadratic: p0=(0,0), p1=(0.5,2), p2=(1,0) — y=0.5 선과 두 번 교차
    // segment A=(0,0.5) B=(1,0.5) — curve 교차 2점이 segment 내에 있다
    const hits: IntersectionHit[] = [];
    segmentQuadraticIntersectionsInto(
      hits,
      { x1: 0, y1: 0.5, x2: 1, y2: 0.5 },
      { kind: 'quadratic', x0: 0, y0: 0, x1: 0.5, y1: 2, x2: 1, y2: 0 }
    );
    expect(hits).toHaveLength(2);
    // tA는 segment parameter [0,1] 범위여야 한다
    for (const h of hits) {
      expect(h.tA).toBeGreaterThanOrEqual(0);
      expect(h.tA).toBeLessThanOrEqual(1);
    }
    // hit point y좌표가 0.5
    expect(hits[0].point.y).toBeCloseTo(0.5, 6);
    expect(hits[1].point.y).toBeCloseTo(0.5, 6);
  });

  test('segment range 밖 hit는 제거된다', () => {
    // quadratic: p0=(0,0), p1=(0.5,2), p2=(1,0), y=0.5 선과 두 번 교차
    // segment A=(0.8,0.5) B=(1.5,0.5) — curve의 두 교차 중 x>0.8인 것만 포함
    const hits: IntersectionHit[] = [];
    segmentQuadraticIntersectionsInto(
      hits,
      { x1: 0.8, y1: 0.5, x2: 1.5, y2: 0.5 },
      { kind: 'quadratic', x0: 0, y0: 0, x1: 0.5, y1: 2, x2: 1, y2: 0 }
    );
    // segment 범위 밖(tA<0)인 hit는 제거됨
    for (const h of hits) {
      expect(h.tA).toBeGreaterThanOrEqual(0);
      expect(h.tA).toBeLessThanOrEqual(1);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// rayQuadraticIntersectionsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('rayQuadraticIntersectionsInto', () => {
  test('ray 앞 방향 hit만 반환한다', () => {
    // quadratic: p0=(0,0), p1=(0.5,2), p2=(1,0), y=0.5 선과 두 번 교차
    // ray: origin=(0,0.5), direction=(1,0) — 오른쪽으로 뻗는 ray
    const hits: IntersectionHit[] = [];
    rayQuadraticIntersectionsInto(
      hits,
      { ox: 0, oy: 0.5, dx: 1, dy: 0 },
      { kind: 'quadratic', x0: 0, y0: 0, x1: 0.5, y1: 2, x2: 1, y2: 0 }
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
    // tA는 ray parameter [0, +∞) 범위여야 한다
    for (const h of hits) {
      expect(h.tA).toBeGreaterThanOrEqual(0);
    }
  });

  test('ray 뒤쪽(tA<0) hit는 제거된다', () => {
    // ray가 curve를 등지는 방향 — hit가 없어야 한다
    const hits: IntersectionHit[] = [];
    rayQuadraticIntersectionsInto(
      hits,
      { ox: 2, oy: 0.5, dx: 1, dy: 0 },
      { kind: 'quadratic', x0: 0, y0: 0, x1: 0.5, y1: 2, x2: 1, y2: 0 }
    );
    // origin x=2에서 +x 방향 — curve(x∈[0,1])가 ray 뒤쪽에 있다
    expect(hits).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// infiniteLineQuadraticIntersectionsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('infiniteLineQuadraticIntersectionsInto', () => {
  test('양방향 hit를 모두 반환한다', () => {
    // quadratic: p0=(0,0), p1=(0.5,2), p2=(1,0), y=0.5 선과 두 번 교차
    const hits: IntersectionHit[] = [];
    infiniteLineQuadraticIntersectionsInto(
      hits,
      { ox: 0, oy: 0.5, dx: 1, dy: 0 },
      { kind: 'quadratic', x0: 0, y0: 0, x1: 0.5, y1: 2, x2: 1, y2: 0 }
    );
    expect(hits).toHaveLength(2);
    for (const h of hits) {
      expect(h.point.y).toBeCloseTo(0.5, 6);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// segmentCubicIntersectionsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('segmentCubicIntersectionsInto', () => {
  test('segment range 내 hit만 반환한다', () => {
    // cubic: p0=(0,0), p1=(0,1), p2=(1,1), p3=(1,0) — 아치형
    // segment A=(0,0.5) B=(1,0.5) — 두 번 교차
    const hits: IntersectionHit[] = [];
    segmentCubicIntersectionsInto(
      hits,
      { x1: 0, y1: 0.5, x2: 1, y2: 0.5 },
      { kind: 'cubic', x0: 0, y0: 0, x1: 0, y1: 1, x2: 1, y2: 1, x3: 1, y3: 0 }
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
    for (const h of hits) {
      expect(h.tA).toBeGreaterThanOrEqual(0);
      expect(h.tA).toBeLessThanOrEqual(1);
      expect(h.point.y).toBeCloseTo(0.5, 5);
    }
  });

  test('segment range 밖 hit는 제거된다', () => {
    // segment가 curve를 지나지 않도록 멀리 있는 경우
    const hits: IntersectionHit[] = [];
    segmentCubicIntersectionsInto(
      hits,
      { x1: 5, y1: 0.5, x2: 6, y2: 0.5 },
      { kind: 'cubic', x0: 0, y0: 0, x1: 0, y1: 1, x2: 1, y2: 1, x3: 1, y3: 0 }
    );
    expect(hits).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// rayCubicIntersectionsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('rayCubicIntersectionsInto', () => {
  test('ray 앞 방향 hit만 반환한다', () => {
    // cubic 아치형: p0=(0,0), p1=(0,1), p2=(1,1), p3=(1,0), y=0.5 교차
    // ray: origin=(-1, 0.5), direction=(1,0) — 왼쪽에서 오른쪽으로
    const hits: IntersectionHit[] = [];
    rayCubicIntersectionsInto(
      hits,
      { ox: -1, oy: 0.5, dx: 1, dy: 0 },
      { kind: 'cubic', x0: 0, y0: 0, x1: 0, y1: 1, x2: 1, y2: 1, x3: 1, y3: 0 }
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
    for (const h of hits) {
      expect(h.tA).toBeGreaterThanOrEqual(0);
    }
  });

  test('ray 뒤쪽 hit는 제거된다', () => {
    // ray가 curve를 등지는 방향 (origin이 curve 오른쪽에서 더 오른쪽으로)
    const hits: IntersectionHit[] = [];
    rayCubicIntersectionsInto(
      hits,
      { ox: 5, oy: 0.5, dx: 1, dy: 0 },
      { kind: 'cubic', x0: 0, y0: 0, x1: 0, y1: 1, x2: 1, y2: 1, x3: 1, y3: 0 }
    );
    expect(hits).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// infiniteLineCubicIntersectionsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('infiniteLineCubicIntersectionsInto', () => {
  test('양방향 hit를 모두 반환한다', () => {
    // cubic 아치형: p0=(0,0), p1=(0,1), p2=(1,1), p3=(1,0), y=0.5 교차
    const hits: IntersectionHit[] = [];
    infiniteLineCubicIntersectionsInto(
      hits,
      { ox: 0, oy: 0.5, dx: 1, dy: 0 },
      { kind: 'cubic', x0: 0, y0: 0, x1: 0, y1: 1, x2: 1, y2: 1, x3: 1, y3: 0 }
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
    for (const h of hits) {
      expect(h.point.y).toBeCloseTo(0.5, 5);
    }
  });
});
