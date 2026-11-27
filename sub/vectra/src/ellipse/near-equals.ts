import type { Ellipse } from '../types/flat-shapes.internal';

/**
 * 두 ellipse가 epsilon 이내에서 근사적으로 같은지 비교한다.
 *
 * cx, cy, rx, ry 각각 |a - b| <= epsilon을 확인한다.
 * 음수 epsilon이면 항상 false를 반환한다.
 *
 * @param a 비교할 첫 번째 ellipse
 * @param b 비교할 두 번째 ellipse
 * @param epsilon 허용 오차 (기본값: 1e-10)
 */
export function nearEquals(a: Ellipse, b: Ellipse, epsilon = 1e-10): boolean {
  // 음수 epsilon: 어떤 거리도 epsilon보다 클 수 없으므로 항상 false
  if (epsilon < 0) {
    return false;
  }

  const ax = a.cx;
  const ay = a.cy;
  const bx = b.cx;
  const by = b.cy;

  return (
    Math.abs(ax - bx) <= epsilon &&
    Math.abs(ay - by) <= epsilon &&
    Math.abs(a.rx - b.rx) <= epsilon &&
    Math.abs(a.ry - b.ry) <= epsilon
  );
}
