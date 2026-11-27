import type { Polygon, Point } from '../types/flat-shapes.internal';
import { polygonBoundaryDistance } from '../internal/polygon';
import { hypot2 } from '../internal/numeric';

/**
 * polygon boundary와 point 사이의 최단 거리를 반환한다.
 *
 * empty polygon(pointCount === 0)은 Infinity를 반환한다.
 * single-point polygon은 해당 point까지의 거리를 반환한다.
 * 내부 점도 boundary까지의 거리를 반환한다(signed distance 아님).
 * repeated-point edge(zero-length segment)는 NaN을 만들지 않는다.
 *
 * @param polygon 거리를 측정할 polygon
 * @param point polygon까지의 거리를 측정할 point
 */
export function distanceToPoint(polygon: Polygon, point: Point): number {
  const n = polygon.length / 2;
  if (n === 0) return Infinity;

  const px = point.x;
  const py = point.y;

  if (n === 1) {
    const dx = polygon[0] - px;
    const dy = polygon[1] - py;
    return hypot2(dx, dy);
  }

  return polygonBoundaryDistance(polygon, px, py, null);
}
