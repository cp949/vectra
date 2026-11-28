/**
 * line-family × circle/rect/bounds 교점 collection helper 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { infiniteLineBoundsIntersections } from '../../../src/intersects/infinite-line-bounds-intersections';
import { infiniteLineCircleIntersections } from '../../../src/intersects/infinite-line-circle-intersections';
import { infiniteLineRectIntersections } from '../../../src/intersects/infinite-line-rect-intersections';
import { rayBoundsIntersections } from '../../../src/intersects/ray-bounds-intersections';
import { rayCircleIntersections } from '../../../src/intersects/ray-circle-intersections';
import { rayRectIntersections } from '../../../src/intersects/ray-rect-intersections';
import { segmentBoundsIntersections } from '../../../src/intersects/segment-bounds-intersections';
import { segmentCircleIntersections } from '../../../src/intersects/segment-circle-intersections';
import { segmentRectIntersections } from '../../../src/intersects/segment-rect-intersections';
import type { XYObjectWritable } from '../../../src/types';

function expectPointClose(p: XYObjectWritable, x: number, y: number, digits = 9): void {
  expect(p.x).toBeCloseTo(x, digits);
  expect(p.y).toBeCloseTo(y, digits);
}

describe('line-family × circle 교점 collection (S10-RM-007)', () => {
  test('segment crossing은 두 점을 segment parameter 오름차순으로 반환한다', () => {
    const points = segmentCircleIntersections({ x1: -10, y1: 0, x2: 10, y2: 0 }, { cx: 0, cy: 0, r: 5 });
    expect(points).toHaveLength(2);
    expectPointClose(points[0], -5, 0);
    expectPointClose(points[1], 5, 0);
  });

  test('segment tangent는 접점 한 점이다', () => {
    const points = segmentCircleIntersections({ x1: -10, y1: 5, x2: 10, y2: 5 }, { cx: 0, cy: 0, r: 5 });
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 0, 5);
  });

  test('segment 전체가 circle 내부면 빈 배열이다', () => {
    const points = segmentCircleIntersections({ x1: -1, y1: 0, x2: 1, y2: 0 }, { cx: 0, cy: 0, r: 5 });
    expect(points).toEqual([]);
  });

  test('ray 시작점 (ox, oy)가 circle 내부면 exit 한 점만 반환한다', () => {
    const points = rayCircleIntersections({ ox: 0, oy: 0, dx: 1, dy: 0 }, { cx: 0, cy: 0, r: 5 });
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 5, 0);
  });

  test('ray range 밖(circle이 ray 뒤)이면 빈 배열이다', () => {
    const points = rayCircleIntersections({ ox: 10, oy: 0, dx: 1, dy: 0 }, { cx: 0, cy: 0, r: 5 });
    expect(points).toEqual([]);
  });

  test('infinite-line은 dx가 음수여도 t 오름차순으로 반환한다', () => {
    const points = infiniteLineCircleIntersections({ ox: 0, oy: 0, dx: -1, dy: 0 }, { cx: 0, cy: 0, r: 5 });
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 5, 0);
    expectPointClose(points[1], -5, 0);
  });

  test('dx = dy = 0인 degenerate infinite-line은 빈 배열이다', () => {
    const points = infiniteLineCircleIntersections({ ox: 0, oy: 0, dx: 0, dy: 0 }, { cx: 0, cy: 0, r: 5 });
    expect(points).toEqual([]);
  });

  test('r이 0 또는 음수인 empty circle은 빈 배열이다', () => {
    expect(segmentCircleIntersections({ x1: -10, y1: 0, x2: 10, y2: 0 }, { cx: 0, cy: 0, r: 0 })).toEqual([]);
    expect(segmentCircleIntersections({ x1: -10, y1: 0, x2: 10, y2: 0 }, { cx: 0, cy: 0, r: -3 })).toEqual([]);
  });
});

describe('line-family × rect/bounds 교점 collection (S10-RM-007)', () => {
  const rect = { x: 0, y: 0, width: 10, height: 10 };

  test('segment crossing은 두 edge 교점을 t 오름차순으로 반환한다', () => {
    const points = segmentRectIntersections({ x1: -5, y1: 5, x2: 15, y2: 5 }, rect);
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 0, 5);
    expectPointClose(points[1], 10, 5);
  });

  test('ray 시작점 (ox, oy)가 rect 내부면 exit 한 점만 반환한다', () => {
    const points = rayRectIntersections({ ox: 5, oy: 5, dx: 1, dy: 0 }, rect);
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 10, 5);
  });

  test('infinite-line은 양방향 두 점을 반환한다', () => {
    const points = infiniteLineRectIntersections({ ox: 5, oy: 5, dx: 1, dy: 0 }, rect);
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 0, 5);
    expectPointClose(points[1], 10, 5);
  });

  test('corner touch는 한 점으로 dedupe된다', () => {
    const points = segmentRectIntersections({ x1: -5, y1: 5, x2: 5, y2: -5 }, rect);
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 0, 0);
  });

  test('edge collinear overlap은 start/end 두 점을 반환한다', () => {
    const points = segmentRectIntersections({ x1: 2, y1: 0, x2: 8, y2: 0 }, rect);
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 2, 0);
    expectPointClose(points[1], 8, 0);
  });

  test('containment-only segment는 빈 배열이다', () => {
    const points = segmentRectIntersections({ x1: 3, y1: 3, x2: 6, y2: 6 }, rect);
    expect(points).toEqual([]);
  });

  test('empty rect(width 0)은 빈 배열이다', () => {
    const points = segmentRectIntersections({ x1: -5, y1: 5, x2: 15, y2: 5 }, { x: 0, y: 0, width: 0, height: 10 });
    expect(points).toEqual([]);
  });

  test('dx = dy = 0인 degenerate 입력은 빈 배열이다', () => {
    const points = infiniteLineRectIntersections({ ox: 5, oy: 5, dx: 0, dy: 0 }, rect);
    expect(points).toEqual([]);
  });

  test('bounds는 rect와 동등한 결과를 반환한다', () => {
    const viaRect = segmentRectIntersections({ x1: -5, y1: 5, x2: 15, y2: 5 }, rect);
    const viaBounds = segmentBoundsIntersections(
      { x1: -5, y1: 5, x2: 15, y2: 5 },
      { minX: 0, minY: 0, maxX: 10, maxY: 10 }
    );
    expect(viaBounds).toEqual(viaRect);
  });

  test('inverted bounds(max < min)은 빈 배열이다', () => {
    const points = segmentBoundsIntersections(
      { x1: -5, y1: 5, x2: 15, y2: 5 },
      { minX: 10, minY: 10, maxX: 0, maxY: 0 }
    );
    expect(points).toEqual([]);
  });

  test('zero-extent bounds(점·선)는 rect(width 0)와 달리 empty로 보지 않는다', () => {
    const seg = { x1: -5, y1: 5, x2: 15, y2: 5 };
    const rectEmpty = segmentRectIntersections(seg, { x: 0, y: 0, width: 0, height: 10 });
    const boundsLine = segmentBoundsIntersections(seg, { minX: 0, minY: 0, maxX: 0, maxY: 10 });
    expect(rectEmpty).toEqual([]);
    expect(boundsLine.length).toBeGreaterThan(0);
    for (const p of boundsLine) expectPointClose(p, 0, 5);
  });

  test('rayBounds는 bounds 좌표로 직접 exit 한 점을 반환한다', () => {
    const points = rayBoundsIntersections({ ox: 5, oy: 5, dx: 1, dy: 0 }, { minX: 0, minY: 0, maxX: 10, maxY: 10 });
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 10, 5);
  });

  test('infiniteLineBounds는 bounds 좌표로 직접 양방향 두 점을 t 오름차순으로 반환한다', () => {
    const points = infiniteLineBoundsIntersections(
      { ox: 5, oy: 5, dx: 1, dy: 0 },
      { minX: 0, minY: 0, maxX: 10, maxY: 10 }
    );
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 0, 5);
    expectPointClose(points[1], 10, 5);
  });
});
