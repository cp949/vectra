import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY } from '../internal/xy';
import type { CircleLike, EllipseLike } from '../types';
import { pointInEllipseClosed } from './ellipse-contains.internal';

/**
 * ellipse가 circle을 conservative하게 포함하면 true를 반환한다.
 *
 * 판정 방법: circle의 axis-aligned bounding square 네 corner가 모두 ellipse closed boundary
 * 안에 있는지 확인한다. false positive는 없지만 false negative가 가능하다 (실제로 안에 들어가는
 * circle이라도 bounding square corner가 ellipse 밖이면 false). exact ellipse-circle relation은
 * 이 함수의 범위가 아니다.
 *
 * empty circle(`radius <= 0`)은 true를 반환한다 (empty는 포함됨).
 * empty ellipse(`radiusX <= 0 || radiusY <= 0`)는 empty circle일 때만 true이고 non-empty circle에는 false다.
 *
 * @param ellipse circle 포함 여부를 판정할 ellipse
 * @param circle ellipse 안에 포함되는지 확인할 circle
 */
export function containsCircle(ellipse: EllipseLike, circle: CircleLike): boolean {
  const r = readCircleRadius(circle);
  // empty circle → true (empty는 포함됨)
  if (r <= 0) return true;
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);
  // empty ellipse + non-empty circle → false
  if (rx <= 0 || ry <= 0) return false;

  const cx = readX(readEllipseCenter(ellipse));
  const cy = readY(readEllipseCenter(ellipse));
  const ccx = readX(readCircleCenter(circle));
  const ccy = readY(readCircleCenter(circle));

  // circle의 axis-aligned bounding square 4 corner
  return (
    pointInEllipseClosed(cx, cy, rx, ry, ccx - r, ccy - r) &&
    pointInEllipseClosed(cx, cy, rx, ry, ccx + r, ccy - r) &&
    pointInEllipseClosed(cx, cy, rx, ry, ccx - r, ccy + r) &&
    pointInEllipseClosed(cx, cy, rx, ry, ccx + r, ccy + r)
  );
}
