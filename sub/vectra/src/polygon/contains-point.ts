import { polygonContainsPoint, readPolygonPoints } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import type { PolygonLike, XYInput } from '../types';

/**
 * polygon이 point를 포함하는지 반환한다.
 *
 * closed boundary 정책: interior와 boundary(edge 위)를 포함한다.
 * epsilon은 boundary proximity threshold다. edge까지의 거리가 epsilon 이하이면 boundary로 판단한다.
 * interior 판정 알고리즘: ray casting.
 * empty polygon(pointCount < 3)은 false를 반환한다.
 * self-intersecting polygon은 repair하지 않고 ray casting 결과를 그대로 반환한다.
 *
 * @param polygon 포함 여부를 확인할 polygon
 * @param point 확인할 point
 * @param epsilon boundary proximity threshold (기본값 0)
 */
export function containsPoint(polygon: PolygonLike, point: XYInput, epsilon = 0): boolean {
  const pts = readPolygonPoints(polygon);
  if (pts.length < 3) return false;
  return polygonContainsPoint(pts, readX(point), readY(point), epsilon);
}
