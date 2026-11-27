import type { Circle, Point } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * circle과 point 사이의 부호 없는 최단 거리를 반환한다.
 *
 * point가 circle 내부나 boundary 위에 있으면 0을 반환한다. empty circle은 center까지의 거리를
 * 반환한다.
 *
 * @param circle 거리를 측정할 circle
 * @param point circle까지의 거리를 측정할 point
 */
export function distanceToPoint(circle: Circle, point: Point): number {
  const cx = circle.cx;
  const cy = circle.cy;
  const px = point.x;
  const py = point.y;
  const dx = px - cx;
  const dy = py - cy;
  const distFromCenter = hypot2(dx, dy);

  const r = circle.r;
  // empty circle: center까지의 거리를 반환한다
  if (r <= 0) return distFromCenter;

  // 내부 또는 경계 위 점은 0을 반환한다
  const d = distFromCenter - r;
  return d > 0 ? d : 0;
}
