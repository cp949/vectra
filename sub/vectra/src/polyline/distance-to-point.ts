import { segDistSq } from '../internal/polyline';
import type { Polyline, Point } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * polyline과 point 사이의 최단 거리를 반환한다.
 *
 * empty polyline은 Infinity를 반환한다.
 * single-point polyline 또는 모든 segment length가 0인 repeated-point polyline은 첫 point까지의 거리를 반환한다.
 * 동거리 closest segment는 앞쪽 segment를 우선한다.
 *
 * @param polyline 거리를 측정할 polyline
 * @param point polyline까지의 거리를 측정할 point
 */
export function distanceToPoint(polyline: Polyline, point: Point): number {
  const points = polyline;
  if (points.length === 0) return Infinity;

  const qx = point.x;
  const qy = point.y;

  if (points.length === 1) {
    const dx = points[0].x - qx;
    const dy = points[0].y - qy;
    return hypot2(dx, dy);
  }

  let bestDistSq = Infinity;

  for (let i = 1; i < points.length; i++) {
    const ax = points[i - 1].x;
    const ay = points[i - 1].y;
    const bx = points[i].x;
    const by = points[i].y;
    const dSq = segDistSq(ax, ay, bx, by, qx, qy);
    if (dSq < bestDistSq) bestDistSq = dSq;
  }

  return Math.sqrt(bestDistSq);
}
