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
  const rect = { x: 0, y: 0, width: 10, height: 10 };
  const bounds = { minX: 0, minY: 0, maxX: 10, maxY: 10 };

  const cases: Array<[string, (v: number) => XYObjectWritable[]]> = [
    [
      'segmentSegment',
      (v) =>
        segmentSegmentIntersections({ a: { x: v, y: 0 }, b: { x: 4, y: 4 } }, { a: { x: 0, y: 4 }, b: { x: 4, y: 0 } }),
    ],
    [
      'ellipseEllipse',
      (v) => ellipseEllipseIntersections({ cx: v, cy: 0, rx: 2, ry: 2 }, { cx: 2, cy: 0, rx: 2, ry: 2 }),
    ],
    ['segmentCircle', (v) => segmentCircleIntersections({ x1: v, y1: 0, x2: 10, y2: 0 }, { cx: 0, cy: 0, r: 5 })],
    ['rayCircle', (v) => rayCircleIntersections({ ox: v, oy: 0, dx: 1, dy: 0 }, { cx: 0, cy: 0, r: 5 })],
    [
      'infiniteLineCircle',
      (v) => infiniteLineCircleIntersections({ ox: v, oy: 0, dx: 1, dy: 0 }, { cx: 0, cy: 0, r: 5 }),
    ],
    [
      'segmentEllipse',
      (v) => segmentEllipseIntersections({ x1: v, y1: 0, x2: 10, y2: 0 }, { cx: 0, cy: 0, rx: 5, ry: 3 }),
    ],
    ['rayEllipse', (v) => rayEllipseIntersections({ ox: v, oy: 0, dx: 1, dy: 0 }, { cx: 0, cy: 0, rx: 5, ry: 3 })],
    [
      'infiniteLineEllipse',
      (v) => infiniteLineEllipseIntersections({ ox: v, oy: 0, dx: 1, dy: 0 }, { cx: 0, cy: 0, rx: 5, ry: 3 }),
    ],
    ['segmentRect', (v) => segmentRectIntersections({ x1: v, y1: 5, x2: 15, y2: 5 }, rect)],
    ['rayRect', (v) => rayRectIntersections({ ox: v, oy: 5, dx: 1, dy: 0 }, rect)],
    ['infiniteLineRect', (v) => infiniteLineRectIntersections({ ox: v, oy: 5, dx: 1, dy: 0 }, rect)],
    ['segmentBounds', (v) => segmentBoundsIntersections({ x1: v, y1: 5, x2: 15, y2: 5 }, bounds)],
    ['rayBounds', (v) => rayBoundsIntersections({ ox: v, oy: 5, dx: 1, dy: 0 }, bounds)],
    ['infiniteLineBounds', (v) => infiniteLineBoundsIntersections({ ox: v, oy: 5, dx: 1, dy: 0 }, bounds)],
    ['circleRect', (v) => circleRectIntersections({ cx: v, cy: 5, r: 3 }, rect)],
    ['circleBounds', (v) => circleBoundsIntersections({ cx: v, cy: 5, r: 3 }, bounds)],
    [
      'circleTriangle',
      (v) => circleTriangleIntersections({ cx: v, cy: 0, r: 2 }, { x1: 0, y1: 0, x2: 10, y2: 0, x3: 0, y3: 10 }),
    ],
    [
      'triangleTriangle',
      (v) =>
        triangleTriangleIntersections(
          { a: { x: v, y: 0 }, b: { x: 6, y: 0 }, c: { x: 0, y: 6 } },
          { a: { x: 2, y: 2 }, b: { x: 8, y: 2 }, c: { x: 2, y: 8 } }
        ),
    ],
    ['ellipseCircle', (v) => ellipseCircleIntersections({ cx: v, cy: 0, rx: 2, ry: 2 }, { cx: 2, cy: 0, r: 2 })],
    [
      'ellipseTriangle',
      (v) =>
        ellipseTriangleIntersections({ cx: v, cy: 0, rx: 4, ry: 2 }, { x1: 0, y1: 0, x2: 10, y2: 0, x3: 0, y3: 10 }),
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
