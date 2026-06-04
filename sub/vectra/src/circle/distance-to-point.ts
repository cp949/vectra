import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY } from '../internal/xy';
import type { CircleLike, XYInput } from '../types';

/**
 * circle과 point 사이의 부호 없는 최단 거리를 반환한다.
 *
 * point가 circle 내부나 boundary 위에 있으면 0을 반환한다. empty circle은 center까지의 거리를
 * 반환한다.
 *
 * @param circle 거리를 측정할 circle
 * @param point circle까지의 거리를 측정할 point
 */
export function distanceToPoint(circle: CircleLike, point: XYInput): number {
  const cx = readX(readCircleCenter(circle));
  const cy = readY(readCircleCenter(circle));
  const px = readX(point);
  const py = readY(point);
  const dx = px - cx;
  const dy = py - cy;
  const distFromCenter = Math.hypot(dx, dy);

  // empty circle: center까지의 거리를 반환한다
  if (readCircleRadius(circle) <= 0) return distFromCenter;

  // 내부 또는 경계 위 점은 0을 반환한다
  const d = distFromCenter - readCircleRadius(circle);
  return d > 0 ? d : 0;
}
