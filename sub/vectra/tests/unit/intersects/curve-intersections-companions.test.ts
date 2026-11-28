/**
 * line-family × Bezier curve allocating companion unit test.
 *
 * S3-RM-031 TASK-03: 6개 facade companion이 대응 *Into 호출과 동치 결과를 반환하고
 * 매 호출마다 새 배열 reference를 생성하는지 검증한다.
 * 교차점 좌표/range 필터링 자체는 *Into 테스트(`intersects-curve.test.ts`)에서 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { infiniteLineCubicIntersections } from '../../../src/intersects/infinite-line-cubic-intersections';
import { infiniteLineCubicIntersectionsInto } from '../../../src/intersects/infinite-line-cubic-intersections-into';
import { infiniteLineQuadraticIntersections } from '../../../src/intersects/infinite-line-quadratic-intersections';
import { infiniteLineQuadraticIntersectionsInto } from '../../../src/intersects/infinite-line-quadratic-intersections-into';
import { rayCubicIntersections } from '../../../src/intersects/ray-cubic-intersections';
import { rayCubicIntersectionsInto } from '../../../src/intersects/ray-cubic-intersections-into';
import { rayQuadraticIntersections } from '../../../src/intersects/ray-quadratic-intersections';
import { rayQuadraticIntersectionsInto } from '../../../src/intersects/ray-quadratic-intersections-into';
import { segmentCubicIntersections } from '../../../src/intersects/segment-cubic-intersections';
import { segmentCubicIntersectionsInto } from '../../../src/intersects/segment-cubic-intersections-into';
import { segmentQuadraticIntersections } from '../../../src/intersects/segment-quadratic-intersections';
import { segmentQuadraticIntersectionsInto } from '../../../src/intersects/segment-quadratic-intersections-into';
import type { IntersectionHit } from '../../../src/types';

// quadratic 아치형: p0=(0,0), p1=(0.5,2), p2=(1,0) — y=0.5 선과 두 번 교차
const QUADRATIC = { kind: 'quadratic', x0: 0, y0: 0, x1: 0.5, y1: 2, x2: 1, y2: 0 } as const;

// cubic 아치형: p0=(0,0), p1=(0,1), p2=(1,1), p3=(1,0) — y=0.5 선과 두 번 교차
const CUBIC = { kind: 'cubic', x0: 0, y0: 0, x1: 0, y1: 1, x2: 1, y2: 1, x3: 1, y3: 0 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// segmentQuadraticIntersections
// ─────────────────────────────────────────────────────────────────────────────

describe('segmentQuadraticIntersections', () => {
  test('교차하는 경우 Into 결과와 동치 배열을 반환한다', () => {
    const segment = { x1: 0, y1: 0.5, x2: 1, y2: 0.5 };
    const expected: IntersectionHit[] = [];
    segmentQuadraticIntersectionsInto(expected, segment, QUADRATIC);

    const actual = segmentQuadraticIntersections(segment, QUADRATIC);

    expect(actual).toEqual(expected);
    expect(actual.length).toBe(2);
  });

  test('교차하지 않으면 빈 배열을 반환한다', () => {
    const segment = { x1: 5, y1: 0.5, x2: 6, y2: 0.5 };
    const actual = segmentQuadraticIntersections(segment, QUADRATIC);
    expect(actual).toEqual([]);
    expect(actual.length).toBe(0);
  });

  test('호출마다 새 배열 reference를 생성한다', () => {
    const segment = { x1: 0, y1: 0.5, x2: 1, y2: 0.5 };
    const a = segmentQuadraticIntersections(segment, QUADRATIC);
    const b = segmentQuadraticIntersections(segment, QUADRATIC);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// segmentCubicIntersections
// ─────────────────────────────────────────────────────────────────────────────

describe('segmentCubicIntersections', () => {
  test('교차하는 경우 Into 결과와 동치 배열을 반환한다', () => {
    const segment = { x1: 0, y1: 0.5, x2: 1, y2: 0.5 };
    const expected: IntersectionHit[] = [];
    segmentCubicIntersectionsInto(expected, segment, CUBIC);

    const actual = segmentCubicIntersections(segment, CUBIC);

    expect(actual).toEqual(expected);
    // cubic 아치는 y=0.5 수평선과 대칭으로 정확히 2점에서 교차한다 (x ≈ 0.115, 0.885).
    expect(actual.length).toBe(2);
  });

  test('교차하지 않으면 빈 배열을 반환한다', () => {
    const segment = { x1: 5, y1: 0.5, x2: 6, y2: 0.5 };
    const actual = segmentCubicIntersections(segment, CUBIC);
    expect(actual).toEqual([]);
    expect(actual.length).toBe(0);
  });

  test('호출마다 새 배열 reference를 생성한다', () => {
    const segment = { x1: 0, y1: 0.5, x2: 1, y2: 0.5 };
    const a = segmentCubicIntersections(segment, CUBIC);
    const b = segmentCubicIntersections(segment, CUBIC);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// rayQuadraticIntersections
// ─────────────────────────────────────────────────────────────────────────────

describe('rayQuadraticIntersections', () => {
  test('교차하는 경우 Into 결과와 동치 배열을 반환한다', () => {
    const ray = { ox: 0, oy: 0.5, dx: 1, dy: 0 };
    const expected: IntersectionHit[] = [];
    rayQuadraticIntersectionsInto(expected, ray, QUADRATIC);

    const actual = rayQuadraticIntersections(ray, QUADRATIC);

    expect(actual).toEqual(expected);
    // quadratic 아치는 y=0.5 수평선과 정확히 2점에서 교차하고 ray가 두 점을 모두 포함한다.
    expect(actual.length).toBe(2);
  });

  test('ray 뒤쪽이면 빈 배열을 반환한다', () => {
    const ray = { ox: 2, oy: 0.5, dx: 1, dy: 0 };
    const actual = rayQuadraticIntersections(ray, QUADRATIC);
    expect(actual).toEqual([]);
  });

  test('호출마다 새 배열 reference를 생성한다', () => {
    const ray = { ox: 0, oy: 0.5, dx: 1, dy: 0 };
    const a = rayQuadraticIntersections(ray, QUADRATIC);
    const b = rayQuadraticIntersections(ray, QUADRATIC);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// rayCubicIntersections
// ─────────────────────────────────────────────────────────────────────────────

describe('rayCubicIntersections', () => {
  test('교차하는 경우 Into 결과와 동치 배열을 반환한다', () => {
    const ray = { ox: -1, oy: 0.5, dx: 1, dy: 0 };
    const expected: IntersectionHit[] = [];
    rayCubicIntersectionsInto(expected, ray, CUBIC);

    const actual = rayCubicIntersections(ray, CUBIC);

    expect(actual).toEqual(expected);
    // cubic 아치는 y=0.5 수평선과 정확히 2점에서 교차하고 ray origin=(-1,0.5)가 두 점을 모두 포함한다.
    expect(actual.length).toBe(2);
  });

  test('ray 뒤쪽이면 빈 배열을 반환한다', () => {
    const ray = { ox: 5, oy: 0.5, dx: 1, dy: 0 };
    const actual = rayCubicIntersections(ray, CUBIC);
    expect(actual).toEqual([]);
  });

  test('호출마다 새 배열 reference를 생성한다', () => {
    const ray = { ox: -1, oy: 0.5, dx: 1, dy: 0 };
    const a = rayCubicIntersections(ray, CUBIC);
    const b = rayCubicIntersections(ray, CUBIC);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// infiniteLineQuadraticIntersections
// ─────────────────────────────────────────────────────────────────────────────

describe('infiniteLineQuadraticIntersections', () => {
  test('교차하는 경우 Into 결과와 동치 배열을 반환한다', () => {
    const line = { ox: 0, oy: 0.5, dx: 1, dy: 0 };
    const expected: IntersectionHit[] = [];
    infiniteLineQuadraticIntersectionsInto(expected, line, QUADRATIC);

    const actual = infiniteLineQuadraticIntersections(line, QUADRATIC);

    expect(actual).toEqual(expected);
    expect(actual.length).toBe(2);
  });

  test('교차하지 않으면 빈 배열을 반환한다', () => {
    // y=5 horizontal infinite-line — quadratic 아치 (max y=1)와 교차 없음
    const line = { ox: 0, oy: 5, dx: 1, dy: 0 };
    const actual = infiniteLineQuadraticIntersections(line, QUADRATIC);
    expect(actual).toEqual([]);
  });

  test('호출마다 새 배열 reference를 생성한다', () => {
    const line = { ox: 0, oy: 0.5, dx: 1, dy: 0 };
    const a = infiniteLineQuadraticIntersections(line, QUADRATIC);
    const b = infiniteLineQuadraticIntersections(line, QUADRATIC);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// infiniteLineCubicIntersections
// ─────────────────────────────────────────────────────────────────────────────

describe('infiniteLineCubicIntersections', () => {
  test('교차하는 경우 Into 결과와 동치 배열을 반환한다', () => {
    const line = { ox: 0, oy: 0.5, dx: 1, dy: 0 };
    const expected: IntersectionHit[] = [];
    infiniteLineCubicIntersectionsInto(expected, line, CUBIC);

    const actual = infiniteLineCubicIntersections(line, CUBIC);

    expect(actual).toEqual(expected);
    // cubic 아치는 y=0.5 수평선과 정확히 2점에서 교차한다 (x ≈ 0.115, 0.885).
    expect(actual.length).toBe(2);
  });

  test('교차하지 않으면 빈 배열을 반환한다', () => {
    // y=5 horizontal infinite-line — cubic 아치 (max y≈0.75)와 교차 없음
    const line = { ox: 0, oy: 5, dx: 1, dy: 0 };
    const actual = infiniteLineCubicIntersections(line, CUBIC);
    expect(actual).toEqual([]);
  });

  test('호출마다 새 배열 reference를 생성한다', () => {
    const line = { ox: 0, oy: 0.5, dx: 1, dy: 0 };
    const a = infiniteLineCubicIntersections(line, CUBIC);
    const b = infiniteLineCubicIntersections(line, CUBIC);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});
