import { describe, expect, test } from 'vitest';
import { intersectsBoundsBounds } from '../../../src/intersects/intersects-bounds-bounds';
import { intersectsBoundsTriangle } from '../../../src/intersects/intersects-bounds-triangle';
import { intersectsCircleBounds } from '../../../src/intersects/intersects-circle-bounds';
import { intersectsCircleCircle } from '../../../src/intersects/intersects-circle-circle';
import { intersectsCircleRect } from '../../../src/intersects/intersects-circle-rect';
import { intersectsCircleTriangle } from '../../../src/intersects/intersects-circle-triangle';
import { intersectsEllipseBounds } from '../../../src/intersects/intersects-ellipse-bounds';
import { intersectsEllipseCircle } from '../../../src/intersects/intersects-ellipse-circle';
import { intersectsEllipseRect } from '../../../src/intersects/intersects-ellipse-rect';
import { intersectsEllipseTriangle } from '../../../src/intersects/intersects-ellipse-triangle';
import { intersectsInfiniteLineInfiniteLine } from '../../../src/intersects/intersects-infinite-line-infinite-line';
import { intersectsPolygonBounds } from '../../../src/intersects/intersects-polygon-bounds';
import { intersectsPolygonRect } from '../../../src/intersects/intersects-polygon-rect';
import { intersectsRayRay } from '../../../src/intersects/intersects-ray-ray';
import { intersectsRectBounds } from '../../../src/intersects/intersects-rect-bounds';
import { intersectsRectRect } from '../../../src/intersects/intersects-rect-rect';
import { intersectsRectTriangle } from '../../../src/intersects/intersects-rect-triangle';
import { intersectsSegmentSegment } from '../../../src/intersects/intersects-segment-segment';
import { intersectsTriangleTriangle } from '../../../src/intersects/intersects-triangle-triangle';

describe('S3-RM-014 canonical intersects owner cleanup', () => {
  const bounds = { min: { x: 0, y: 0 }, max: { x: 4, y: 4 } };
  const rect = { x: 1, y: 1, width: 3, height: 3 };
  const circle = { center: { x: 2, y: 2 }, radius: 1 };
  const ellipse = { center: { x: 2, y: 2 }, radiusX: 2, radiusY: 1 };
  const triangle = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };
  const polygon = [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 4, y: 4 },
    { x: 0, y: 4 },
  ];

  test('closed area canonical pair leaves return true for overlap/touch cases', () => {
    expect(intersectsBoundsBounds(bounds, { min: { x: 4, y: 4 }, max: { x: 5, y: 5 } })).toBe(true);
    expect(intersectsCircleBounds(circle, bounds)).toBe(true);
    expect(intersectsCircleCircle(circle, { center: { x: 3, y: 2 }, radius: 1 })).toBe(true);
    expect(intersectsCircleRect(circle, rect)).toBe(true);
    expect(intersectsEllipseBounds(ellipse, bounds)).toBe(true);
    expect(intersectsEllipseCircle(ellipse, circle)).toBe(true);
    expect(intersectsEllipseRect(ellipse, rect)).toBe(true);
    expect(intersectsEllipseTriangle(ellipse, triangle)).toBe(true);
    expect(intersectsPolygonBounds(polygon, bounds)).toBe(true);
    expect(intersectsPolygonRect(polygon, rect)).toBe(true);
    expect(intersectsRectBounds(rect, bounds)).toBe(true);
    expect(intersectsRectRect(rect, { x: 4, y: 4, width: 2, height: 2 })).toBe(true);
    expect(intersectsBoundsTriangle(bounds, triangle)).toBe(true);
    expect(intersectsCircleTriangle(circle, triangle)).toBe(true);
    expect(intersectsRectTriangle(rect, triangle)).toBe(true);
    expect(intersectsTriangleTriangle(triangle, { a: { x: 4, y: 0 }, b: { x: 5, y: 0 }, c: { x: 4, y: 1 } })).toBe(
      true
    );
  });

  test('line-family same-domain canonical pair leaves return true for shared points', () => {
    expect(
      intersectsSegmentSegment({ a: { x: 0, y: 0 }, b: { x: 4, y: 4 } }, { a: { x: 0, y: 4 }, b: { x: 4, y: 0 } })
    ).toBe(true);
    expect(
      intersectsRayRay(
        { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } },
        { origin: { x: 2, y: 0 }, direction: { x: 1, y: 0 } }
      )
    ).toBe(true);
    expect(
      intersectsInfiniteLineInfiniteLine(
        { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } },
        { origin: { x: 0, y: 1 }, direction: { x: 0, y: -1 } }
      )
    ).toBe(true);
  });
});
