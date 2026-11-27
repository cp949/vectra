import type { Rect, Point } from '../types/flat-shapes.internal';

/**
 * point가 rect의 closed boundary 안에 있는지 반환한다.
 *
 * left/right/top/bottom edge 위의 점을 포함한다.
 * empty rect(width <= 0 또는 height <= 0)는 false를 반환한다.
 *
 * @param rect point를 포함하는지 검사할 rect
 * @param point rect containment를 검사할 point
 */
export function containsPoint(rect: Rect, point: Point): boolean {
  const x = rect.x;
  const y = rect.y;
  const width = rect.width;
  const height = rect.height;
  if (width <= 0 || height <= 0) return false;
  const px = point.x;
  const py = point.y;
  return px >= x && px <= x + width && py >= y && py <= y + height;
}
