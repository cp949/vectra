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
  const circle = { cx: 2, cy: 2, r: 1 };
  const ellipse = { cx: 2, cy: 2, rx: 2, ry: 1 };
  const triangle = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };
  const polygon = [0, 0, 4, 0, 4, 4, 0, 4];

  test('closed area canonical pair leaves return true for overlap/touch cases', () => {
    expect(intersectsBoundsBounds(bounds, { min: { x: 4, y: 4 }, max: { x: 5, y: 5 } })).toBe(true);
    expect(intersectsCircleBounds({ cx: 2, cy: 2, r: 1 }, { minX: 0, minY: 0, maxX: 4, maxY: 4 })).toBe(true);
    expect(intersectsCircleCircle({ cx: 2, cy: 2, r: 1 }, { cx: 3, cy: 2, r: 1 })).toBe(true);
    expect(intersectsCircleRect({ cx: 2, cy: 2, r: 1 }, rect)).toBe(true);
    expect(intersectsEllipseBounds(ellipse, { minX: 0, minY: 0, maxX: 4, maxY: 4 })).toBe(true);
    expect(intersectsEllipseCircle(ellipse, circle)).toBe(true);
    expect(intersectsEllipseRect(ellipse, rect)).toBe(true);
    expect(intersectsEllipseTriangle(ellipse, { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 4 })).toBe(true);
    expect(intersectsPolygonBounds(polygon, { minX: 0, minY: 0, maxX: 4, maxY: 4 })).toBe(true);
    expect(intersectsPolygonRect(polygon, rect)).toBe(true);
    expect(intersectsRectBounds(rect, bounds)).toBe(true);
    expect(intersectsRectRect(rect, { x: 4, y: 4, width: 2, height: 2 })).toBe(true);
    expect(intersectsBoundsTriangle(bounds, triangle)).toBe(true);
    expect(intersectsCircleTriangle({ cx: 2, cy: 2, r: 1 }, { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 4 })).toBe(true);
    expect(intersectsRectTriangle(rect, triangle)).toBe(true);
    expect(intersectsTriangleTriangle(triangle, { a: { x: 4, y: 0 }, b: { x: 5, y: 0 }, c: { x: 4, y: 1 } })).toBe(
      true
    );
  });

  test('line-family same-domain canonical pair leaves return true for shared points', () => {
    expect(
      intersectsSegmentSegment({ a: { x: 0, y: 0 }, b: { x: 4, y: 4 } }, { a: { x: 0, y: 4 }, b: { x: 4, y: 0 } })
    ).toBe(true);
    expect(intersectsRayRay({ ox: 0, oy: 0, dx: 1, dy: 0 }, { ox: 2, oy: 0, dx: 1, dy: 0 })).toBe(true);
    expect(intersectsInfiniteLineInfiniteLine({ ox: 0, oy: 0, dx: 1, dy: 0 }, { ox: 0, oy: 1, dx: 0, dy: -1 })).toBe(
      true
    );
  });
});
