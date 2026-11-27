import type { Polygon, Point } from '../types/flat-shapes.internal';
import { polygonContainsPoint } from '../internal/polygon';

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
export function containsPoint(polygon: Polygon, point: Point, epsilon = 0): boolean {
  if (polygon.length < 6) return false;
  return polygonContainsPoint(polygon, point.x, point.y, epsilon);
}
