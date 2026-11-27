import type { Circle, Point } from '../types/flat-shapes.internal';

/**
 * point가 circle 내부나 boundary 위에 있으면 true를 반환한다.
 *
 * 포함 판정은 closed boundary 기준이다. radius <= 0인 empty circle은 false를 반환한다.
 *
 * @param circle point 포함 여부를 판정할 circle
 * @param point circle 안에 포함되는지 확인할 point
 */
export function containsPoint(circle: Circle, point: Point): boolean {
  // empty circle은 항상 false
  const r = circle.r;
  if (r <= 0) return false;

  const cx = circle.cx;
  const cy = circle.cy;
  const px = point.x;
  const py = point.y;
  const dx = px - cx;
  const dy = py - cy;
  // distanceSq 패턴으로 sqrt 호출을 줄인다. 경계 포함(closed boundary)
  return dx * dx + dy * dy <= r * r;
}
