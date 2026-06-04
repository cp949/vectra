import { describe, expect, test } from 'vitest';
import { raysFromPointToPolygon } from '../../../src/intersects/rays-from-point-to-polygon';
import { raysFromPointToPolygonInto } from '../../../src/intersects/rays-from-point-to-polygon-into';
import { visibilityPolygon } from '../../../src/intersects/visibility-polygon';
import { visibilityPolygonInto } from '../../../src/intersects/visibility-polygon-into';
import type { PolygonLike, VisibilityRayHit, XYInput, XYObjectWritable } from '../../../src/types';

const p = (x: number, y: number): XYInput => ({ x, y });
const polygon = (...pts: XYInput[]): PolygonLike => ({ points: pts });

const square = polygon(p(0, 0), p(4, 0), p(4, 4), p(0, 4));
// 가까운 obstacle (x∈[-2,-1]) / 먼 obstacle (x∈[3,4]). O=(-5,0)에서 near가 far를 완전히 가린다.
const nearBox = polygon(p(-2, -1), p(-1, -1), p(-1, 1), p(-2, 1));
const farBox = polygon(p(3, -1), p(4, -1), p(4, 1), p(3, 1));

function onSquareBoundary(pt: { x: number; y: number }): boolean {
  const onX = (Math.abs(pt.x) < 1e-6 || Math.abs(pt.x - 4) < 1e-6) && pt.y >= -1e-6 && pt.y <= 4 + 1e-6;
  const onY = (Math.abs(pt.y) < 1e-6 || Math.abs(pt.y - 4) < 1e-6) && pt.x >= -1e-6 && pt.x <= 4 + 1e-6;
  return onX || onY;
}

function isSorted(hits: VisibilityRayHit[]): boolean {
  for (let i = 1; i < hits.length; i++) {
    if (hits[i].angle < hits[i - 1].angle) return false;
  }
  return true;
}

function hasPoint(hits: VisibilityRayHit[], x: number, y: number): boolean {
  return hits.some((h) => Math.abs(h.point.x - x) < 1e-6 && Math.abs(h.point.y - y) < 1e-6);
}

const SQUARE_CORNERS: Array<[number, number]> = [
  [0, 0],
  [4, 0],
  [4, 4],
  [0, 4],
];

function expectCornerOrder(pts: Array<{ x: number; y: number }>): void {
  expect(pts).toHaveLength(4);
  SQUARE_CORNERS.forEach(([x, y], i) => {
    expect(pts[i].x).toBeCloseTo(x, 9);
    expect(pts[i].y).toBeCloseTo(y, 9);
  });
}

describe('raysFromPointToPolygon', () => {
  test('단일 사각형 obstacle에서 hit을 angle 오름차순으로 반환하고 모든 vertex를 포함한다', () => {
    const hits = raysFromPointToPolygon(p(2, 2), [square]);
    expect(hits.length).toBeGreaterThanOrEqual(4);
    expect(isSorted(hits)).toBe(true);
    expect(hits.every((h) => onSquareBoundary(h.point))).toBe(true);
    expect(hasPoint(hits, 0, 0)).toBe(true);
    expect(hasPoint(hits, 4, 0)).toBe(true);
    expect(hasPoint(hits, 4, 4)).toBe(true);
    expect(hasPoint(hits, 0, 4)).toBe(true);
  });

  test('angleOffset 0이면 vertex 방향 ray만 남아 4개 corner를 angle 순서로 반환한다', () => {
    const hits = raysFromPointToPolygon(p(2, 2), [square], { angleOffset: 0 });
    expectCornerOrder(hits.map((h) => h.point));
    expect(hits.every((h) => h.polygonIndex === 0)).toBe(true);
  });

  test('가까운 obstacle이 먼 obstacle을 같은 방향에서 가리면 가까운 hit만 반환한다', () => {
    const hits = raysFromPointToPolygon(p(-5, 0), [nearBox, farBox]);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.polygonIndex === 0)).toBe(true);
    expect(hits.every((h) => Math.abs(h.point.x - -2) < 1e-6)).toBe(true);
  });

  test('angleOffset이 vertex 뒤 edge hit을 만든다', () => {
    const baseline = raysFromPointToPolygon(p(2, 2), [square], { angleOffset: 0 });
    const withOffset = raysFromPointToPolygon(p(2, 2), [square]);
    expect(withOffset.length).toBeGreaterThan(baseline.length);
  });

  test('empty obstacle list는 빈 배열이다', () => {
    expect(raysFromPointToPolygon(p(0, 0), [])).toEqual([]);
  });

  test('origin이 boundary 위면 zero-distance hit을 제외한다', () => {
    const hits = raysFromPointToPolygon(p(2, 0), [square]);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.distance > 1e-6)).toBe(true);
    expect(isSorted(hits)).toBe(true);
  });

  test('origin이 boundary 위이고 첫 교점이 zero-distance여도 같은 ray의 뒤쪽 hit을 반환한다', () => {
    const hits = raysFromPointToPolygon(p(0, 2), [square], { angleOffset: 0 });
    expect(hits.every((h) => h.distance > 1e-6)).toBe(true);
    expect(hasPoint(hits, 4, 0)).toBe(true);
    expect(hasPoint(hits, 4, 4)).toBe(true);
  });

  test('Into는 기존 out 내용을 clear하고 같은 array reference를 반환한다', () => {
    const out: VisibilityRayHit[] = [{ point: { x: 9, y: 9 }, angle: 0, distance: 1, polygonIndex: 5, edgeIndex: 5 }];
    const result = raysFromPointToPolygonInto(out, p(2, 2), [square], { angleOffset: 0 });
    expect(result).toBe(out);
    expectCornerOrder(out.map((h) => h.point));
  });

  test('companion은 새 array를 반환한다', () => {
    const a = raysFromPointToPolygon(p(2, 2), [square]);
    const b = raysFromPointToPolygon(p(2, 2), [square]);
    expect(a).not.toBe(b);
  });
});

describe('visibilityPolygon', () => {
  test('hit point만 angle 순서로 반환하고 순서가 raysFromPointToPolygon과 같다', () => {
    const hits = raysFromPointToPolygon(p(2, 2), [square]);
    const poly = visibilityPolygon(p(2, 2), [square]);
    expect(poly).toEqual(hits.map((h) => ({ x: h.point.x, y: h.point.y })));
  });

  test('Into는 기존 out 내용을 clear하고 같은 array reference를 반환한다', () => {
    const out: XYObjectWritable[] = [{ x: 9, y: 9 }];
    const result = visibilityPolygonInto(out, p(2, 2), [square], { angleOffset: 0 });
    expect(result).toBe(out);
    expectCornerOrder(out);
  });

  test('empty obstacle list는 빈 배열이다', () => {
    expect(visibilityPolygon(p(0, 0), [])).toEqual([]);
  });
});
