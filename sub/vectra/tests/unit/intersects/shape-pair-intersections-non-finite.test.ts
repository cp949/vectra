/**
 * shape-pair 교점 collection non-finite 입력 policy 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { circleBoundsIntersections } from '../../../src/intersects/circle-bounds-intersections';
import { circleRectIntersections } from '../../../src/intersects/circle-rect-intersections';
import { circleTriangleIntersections } from '../../../src/intersects/circle-triangle-intersections';
import { ellipseCircleIntersections } from '../../../src/intersects/ellipse-circle-intersections';
import { ellipseEllipseIntersections } from '../../../src/intersects/ellipse-ellipse-intersections';
import { ellipseTriangleIntersections } from '../../../src/intersects/ellipse-triangle-intersections';
import { infiniteLineBoundsIntersections } from '../../../src/intersects/infinite-line-bounds-intersections';
import { infiniteLineCircleIntersections } from '../../../src/intersects/infinite-line-circle-intersections';
import { infiniteLineEllipseIntersections } from '../../../src/intersects/infinite-line-ellipse-intersections';
import { infiniteLineRectIntersections } from '../../../src/intersects/infinite-line-rect-intersections';
import { rayBoundsIntersections } from '../../../src/intersects/ray-bounds-intersections';
import { rayCircleIntersections } from '../../../src/intersects/ray-circle-intersections';
import { rayEllipseIntersections } from '../../../src/intersects/ray-ellipse-intersections';
import { rayRectIntersections } from '../../../src/intersects/ray-rect-intersections';
import { segmentBoundsIntersections } from '../../../src/intersects/segment-bounds-intersections';
import { segmentCircleIntersections } from '../../../src/intersects/segment-circle-intersections';
import { segmentEllipseIntersections } from '../../../src/intersects/segment-ellipse-intersections';
import { segmentRectIntersections } from '../../../src/intersects/segment-rect-intersections';
import { segmentSegmentIntersections } from '../../../src/intersects/segment-segment-intersections';
import { triangleTriangleIntersections } from '../../../src/intersects/triangle-triangle-intersections';
import type { XYObjectWritable } from '../../../src/types';

describe('non-finite 입력 pass-through은 빈 collection이다 (S10-RM-007)', () => {
  const circle = { center: { x: 0, y: 0 }, radius: 5 };
  const ellipse = { center: { x: 0, y: 0 }, radiusX: 5, radiusY: 3 };
  const rect = { x: 0, y: 0, width: 10, height: 10 };
  const bounds = { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } };
  const triangle = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 0, y: 10 } };

  const cases: Array<[string, (v: number) => XYObjectWritable[]]> = [
    [
      'segmentSegment',
      (v) =>
        segmentSegmentIntersections({ a: { x: v, y: 0 }, b: { x: 4, y: 4 } }, { a: { x: 0, y: 4 }, b: { x: 4, y: 0 } }),
    ],
    [
      'ellipseEllipse',
      (v) =>
        ellipseEllipseIntersections(
          { center: { x: v, y: 0 }, radiusX: 2, radiusY: 2 },
          { center: { x: 2, y: 0 }, radiusX: 2, radiusY: 2 }
        ),
    ],
    ['segmentCircle', (v) => segmentCircleIntersections({ a: { x: v, y: 0 }, b: { x: 10, y: 0 } }, circle)],
    ['rayCircle', (v) => rayCircleIntersections({ origin: { x: v, y: 0 }, direction: { x: 1, y: 0 } }, circle)],
    [
      'infiniteLineCircle',
      (v) => infiniteLineCircleIntersections({ origin: { x: v, y: 0 }, direction: { x: 1, y: 0 } }, circle),
    ],
    ['segmentEllipse', (v) => segmentEllipseIntersections({ a: { x: v, y: 0 }, b: { x: 10, y: 0 } }, ellipse)],
    ['rayEllipse', (v) => rayEllipseIntersections({ origin: { x: v, y: 0 }, direction: { x: 1, y: 0 } }, ellipse)],
    [
      'infiniteLineEllipse',
      (v) => infiniteLineEllipseIntersections({ origin: { x: v, y: 0 }, direction: { x: 1, y: 0 } }, ellipse),
    ],
    ['segmentRect', (v) => segmentRectIntersections({ a: { x: v, y: 5 }, b: { x: 15, y: 5 } }, rect)],
    ['rayRect', (v) => rayRectIntersections({ origin: { x: v, y: 5 }, direction: { x: 1, y: 0 } }, rect)],
    [
      'infiniteLineRect',
      (v) => infiniteLineRectIntersections({ origin: { x: v, y: 5 }, direction: { x: 1, y: 0 } }, rect),
    ],
    ['segmentBounds', (v) => segmentBoundsIntersections({ a: { x: v, y: 5 }, b: { x: 15, y: 5 } }, bounds)],
    ['rayBounds', (v) => rayBoundsIntersections({ origin: { x: v, y: 5 }, direction: { x: 1, y: 0 } }, bounds)],
    [
      'infiniteLineBounds',
      (v) => infiniteLineBoundsIntersections({ origin: { x: v, y: 5 }, direction: { x: 1, y: 0 } }, bounds),
    ],
    ['circleRect', (v) => circleRectIntersections({ center: { x: v, y: 5 }, radius: 3 }, rect)],
    ['circleBounds', (v) => circleBoundsIntersections({ center: { x: v, y: 5 }, radius: 3 }, bounds)],
    ['circleTriangle', (v) => circleTriangleIntersections({ center: { x: v, y: 0 }, radius: 2 }, triangle)],
    [
      'triangleTriangle',
      (v) =>
        triangleTriangleIntersections(
          { a: { x: v, y: 0 }, b: { x: 6, y: 0 }, c: { x: 0, y: 6 } },
          { a: { x: 2, y: 2 }, b: { x: 8, y: 2 }, c: { x: 2, y: 8 } }
        ),
    ],
    [
      'ellipseCircle',
      (v) =>
        ellipseCircleIntersections(
          { center: { x: v, y: 0 }, radiusX: 2, radiusY: 2 },
          { center: { x: 2, y: 0 }, radius: 2 }
        ),
    ],
    [
      'ellipseTriangle',
      (v) => ellipseTriangleIntersections({ center: { x: v, y: 0 }, radiusX: 4, radiusY: 2 }, triangle),
    ],
  ];

  for (const [name, invoke] of cases) {
    for (const v of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      test(`${name} — ${String(v)} 좌표는 빈 배열`, () => {
        expect(invoke(v)).toEqual([]);
      });
    }
  }
});
