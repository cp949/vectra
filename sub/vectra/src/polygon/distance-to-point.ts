import { polygonBoundaryDistance, readPolygonPoints } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import type { PolygonLike, XYInput } from '../types';

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
export function distanceToPoint(polygon: PolygonLike, point: XYInput): number {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;
  if (n === 0) return Infinity;

  const px = readX(point);
  const py = readY(point);

  if (n === 1) {
    const dx = readX(pts[0]) - px;
    const dy = readY(pts[0]) - py;
    return Math.hypot(dx, dy);
  }

  return polygonBoundaryDistance(pts, px, py, null);
}
