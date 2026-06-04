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
  const circle = { center: { x: 0, y: 0 }, radius: 5 };

  test('segment crossing은 두 점을 segment parameter 오름차순으로 반환한다', () => {
    const points = segmentCircleIntersections({ a: { x: -10, y: 0 }, b: { x: 10, y: 0 } }, circle);
    expect(points).toHaveLength(2);
    expectPointClose(points[0], -5, 0);
    expectPointClose(points[1], 5, 0);
  });

  test('segment tangent는 접점 한 점이다', () => {
    const points = segmentCircleIntersections({ a: { x: -10, y: 5 }, b: { x: 10, y: 5 } }, circle);
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 0, 5);
  });

  test('segment 전체가 circle 내부면 빈 배열이다', () => {
    const points = segmentCircleIntersections({ a: { x: -1, y: 0 }, b: { x: 1, y: 0 } }, circle);
    expect(points).toEqual([]);
  });

  test('ray origin이 circle 내부면 exit 한 점만 반환한다', () => {
    const points = rayCircleIntersections({ origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }, circle);
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 5, 0);
  });

  test('ray range 밖(circle이 ray 뒤)이면 빈 배열이다', () => {
    const points = rayCircleIntersections({ origin: { x: 10, y: 0 }, direction: { x: 1, y: 0 } }, circle);
    expect(points).toEqual([]);
  });

  test('infinite-line은 direction이 음수여도 t 오름차순으로 반환한다', () => {
    const points = infiniteLineCircleIntersections({ origin: { x: 0, y: 0 }, direction: { x: -1, y: 0 } }, circle);
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 5, 0);
    expectPointClose(points[1], -5, 0);
  });

  test('zero direction(degenerate)은 빈 배열이다', () => {
    const points = infiniteLineCircleIntersections({ origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } }, circle);
    expect(points).toEqual([]);
  });

  test('radius 0/negative empty circle은 빈 배열이다', () => {
    expect(
      segmentCircleIntersections({ a: { x: -10, y: 0 }, b: { x: 10, y: 0 } }, { center: { x: 0, y: 0 }, radius: 0 })
    ).toEqual([]);
    expect(
      segmentCircleIntersections({ a: { x: -10, y: 0 }, b: { x: 10, y: 0 } }, { center: { x: 0, y: 0 }, radius: -3 })
    ).toEqual([]);
  });

  test('tuple 입력과 object 입력 결과가 같다', () => {
    const objs = segmentCircleIntersections({ a: { x: -10, y: 0 }, b: { x: 10, y: 0 } }, circle);
    const tuples = segmentCircleIntersections(
      [
        [-10, 0],
        [10, 0],
      ],
      [[0, 0], 5]
    );
    expect(tuples).toEqual(objs);
  });
});

describe('line-family × rect/bounds 교점 collection (S10-RM-007)', () => {
  const rect = { x: 0, y: 0, width: 10, height: 10 };

  test('segment crossing은 두 edge 교점을 t 오름차순으로 반환한다', () => {
    const points = segmentRectIntersections({ a: { x: -5, y: 5 }, b: { x: 15, y: 5 } }, rect);
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 0, 5);
    expectPointClose(points[1], 10, 5);
  });

  test('ray origin이 rect 내부면 exit 한 점만 반환한다', () => {
    const points = rayRectIntersections({ origin: { x: 5, y: 5 }, direction: { x: 1, y: 0 } }, rect);
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 10, 5);
  });

  test('infinite-line은 양방향 두 점을 반환한다', () => {
    const points = infiniteLineRectIntersections({ origin: { x: 5, y: 5 }, direction: { x: 1, y: 0 } }, rect);
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 0, 5);
    expectPointClose(points[1], 10, 5);
  });

  test('corner touch는 한 점으로 dedupe된다', () => {
    const points = segmentRectIntersections({ a: { x: -5, y: 5 }, b: { x: 5, y: -5 } }, rect);
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 0, 0);
  });

  test('edge collinear overlap은 start/end 두 점을 반환한다', () => {
    const points = segmentRectIntersections({ a: { x: 2, y: 0 }, b: { x: 8, y: 0 } }, rect);
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 2, 0);
    expectPointClose(points[1], 8, 0);
  });

  test('containment-only segment는 빈 배열이다', () => {
    const points = segmentRectIntersections({ a: { x: 3, y: 3 }, b: { x: 6, y: 6 } }, rect);
    expect(points).toEqual([]);
  });

  test('empty rect(width 0)은 빈 배열이다', () => {
    const points = segmentRectIntersections(
      { a: { x: -5, y: 5 }, b: { x: 15, y: 5 } },
      { x: 0, y: 0, width: 0, height: 10 }
    );
    expect(points).toEqual([]);
  });

  test('zero direction(degenerate)은 빈 배열이다', () => {
    const points = infiniteLineRectIntersections({ origin: { x: 5, y: 5 }, direction: { x: 0, y: 0 } }, rect);
    expect(points).toEqual([]);
  });

  test('bounds는 rect와 동등한 결과를 반환한다', () => {
    const viaRect = segmentRectIntersections({ a: { x: -5, y: 5 }, b: { x: 15, y: 5 } }, rect);
    const viaBounds = segmentBoundsIntersections(
      { a: { x: -5, y: 5 }, b: { x: 15, y: 5 } },
      { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }
    );
    expect(viaBounds).toEqual(viaRect);
  });

  test('inverted bounds(max < min)은 빈 배열이다', () => {
    const points = segmentBoundsIntersections(
      { a: { x: -5, y: 5 }, b: { x: 15, y: 5 } },
      { min: { x: 10, y: 10 }, max: { x: 0, y: 0 } }
    );
    expect(points).toEqual([]);
  });

  test('zero-extent bounds(점·선)는 rect(width 0)와 달리 empty로 보지 않는다', () => {
    const seg = { a: { x: -5, y: 5 }, b: { x: 15, y: 5 } };
    const rectEmpty = segmentRectIntersections(seg, { x: 0, y: 0, width: 0, height: 10 });
    const boundsLine = segmentBoundsIntersections(seg, { min: { x: 0, y: 0 }, max: { x: 0, y: 10 } });
    expect(rectEmpty).toEqual([]);
    expect(boundsLine.length).toBeGreaterThan(0);
    for (const p of boundsLine) expectPointClose(p, 0, 5);
  });

  test('rayBounds는 bounds 좌표로 직접 exit 한 점을 반환한다', () => {
    const points = rayBoundsIntersections(
      { origin: { x: 5, y: 5 }, direction: { x: 1, y: 0 } },
      { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }
    );
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 10, 5);
  });

  test('infiniteLineBounds는 bounds 좌표로 직접 양방향 두 점을 t 오름차순으로 반환한다', () => {
    const points = infiniteLineBoundsIntersections(
      { origin: { x: 5, y: 5 }, direction: { x: 1, y: 0 } },
      { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }
    );
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 0, 5);
    expectPointClose(points[1], 10, 5);
  });

  test('tuple 입력과 object 입력 결과가 같다', () => {
    const objs = segmentRectIntersections({ a: { x: -5, y: 5 }, b: { x: 15, y: 5 } }, rect);
    const tuples = segmentRectIntersections(
      [
        [-5, 5],
        [15, 5],
      ],
      [0, 0, 10, 10]
    );
    expect(tuples).toEqual(objs);
  });
});
