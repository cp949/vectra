import { readPolylinePoints, segDistSq } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import type { PolylineLike, XYInput } from '../types';

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
export function distanceToPoint(polyline: PolylineLike, point: XYInput): number {
  const points = readPolylinePoints(polyline);
  if (points.length === 0) return Infinity;

  const qx = readX(point);
  const qy = readY(point);

  if (points.length === 1) {
    const dx = readX(points[0]) - qx;
    const dy = readY(points[0]) - qy;
    return Math.hypot(dx, dy);
  }

  let bestDistSq = Infinity;

  for (let i = 1; i < points.length; i++) {
    const ax = readX(points[i - 1]);
    const ay = readY(points[i - 1]);
    const bx = readX(points[i]);
    const by = readY(points[i]);
    const dSq = segDistSq(ax, ay, bx, by, qx, qy);
    if (dSq < bestDistSq) bestDistSq = dSq;
  }

  return Math.sqrt(bestDistSq);
}
