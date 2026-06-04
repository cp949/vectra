import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY } from '../internal/xy';
import type { CircleLike, XYInput } from '../types';

/**
 * point가 circle 내부나 boundary 위에 있으면 true를 반환한다.
 *
 * 포함 판정은 closed boundary 기준이다. radius <= 0인 empty circle은 false를 반환한다.
 *
 * @param circle point 포함 여부를 판정할 circle
 * @param point circle 안에 포함되는지 확인할 point
 */
export function containsPoint(circle: CircleLike, point: XYInput): boolean {
  // empty circle은 항상 false
  if (readCircleRadius(circle) <= 0) return false;

  const cx = readX(readCircleCenter(circle));
  const cy = readY(readCircleCenter(circle));
  const px = readX(point);
  const py = readY(point);
  const dx = px - cx;
  const dy = py - cy;
  // distanceSq 패턴으로 sqrt 호출을 줄인다. 경계 포함(closed boundary)
  return dx * dx + dy * dy <= readCircleRadius(circle) * readCircleRadius(circle);
}
