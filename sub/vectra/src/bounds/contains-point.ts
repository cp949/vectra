import type { Bounds, Point } from '../types/flat-shapes.internal';

/**
 * point가 bounds 안이나 boundary 위에 있으면 true를 반환한다.
 *
 * 포함 판정은 closed boundary 기준이다. inverted bounds는 empty로 보고 항상 false를 반환한다.
 *
 * @param bounds point 포함 여부를 판정할 bounds
 * @param point bounds 안에 포함되는지 확인할 point
 */
export function containsPoint(bounds: Bounds, point: Point): boolean {
  const minX = bounds.minX;
  const minY = bounds.minY;
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;
  // empty bounds(inverted)는 항상 false
  if (maxX < minX || maxY < minY) return false;
  const px = point.x;
  const py = point.y;
  return minX <= px && px <= maxX && minY <= py && py <= maxY;
}
