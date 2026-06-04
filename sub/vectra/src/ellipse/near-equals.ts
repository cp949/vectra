import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY } from '../internal/xy';
import type { EllipseLike } from '../types';

/**
 * 두 ellipse가 epsilon 이내에서 근사적으로 같은지 비교한다.
 *
 * center의 x/y, radiusX, radiusY 각각 |a - b| <= epsilon을 확인한다.
 * 음수 epsilon이면 항상 false를 반환한다.
 *
 * @param a 비교할 첫 번째 ellipse
 * @param b 비교할 두 번째 ellipse
 * @param epsilon 허용 오차 (기본값: 1e-10)
 */
export function nearEquals(a: EllipseLike, b: EllipseLike, epsilon = 1e-10): boolean {
  // 음수 epsilon: 어떤 거리도 epsilon보다 클 수 없으므로 항상 false
  if (epsilon < 0) {
    return false;
  }

  const ax = readX(readEllipseCenter(a));
  const ay = readY(readEllipseCenter(a));
  const bx = readX(readEllipseCenter(b));
  const by = readY(readEllipseCenter(b));

  return (
    Math.abs(ax - bx) <= epsilon &&
    Math.abs(ay - by) <= epsilon &&
    Math.abs(readEllipseRadiusX(a) - readEllipseRadiusX(b)) <= epsilon &&
    Math.abs(readEllipseRadiusY(a) - readEllipseRadiusY(b)) <= epsilon
  );
}
