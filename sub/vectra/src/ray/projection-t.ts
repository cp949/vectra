import type { Ray, Point } from '../types/flat-shapes.internal';

/**
 * `point`의 ray supporting infinite-line 위 parametric 위치 `t`를 unclamped로 반환한다.
 *
 * ray forward/backward 구분 없이 supporting infinite-line 기준으로 계산한다.
 * degenerate ray(`directionLengthSq === 0`)에서는 `0`을 반환한다.
 * division-by-zero guard 외에는 epsilon 비교를 하지 않는다.
 */
export function projectionT(ray: Ray, point: Point): number {
  const { ox, oy, dx, dy } = ray;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return 0;
  const px = point.x - ox;
  const py = point.y - oy;
  return (px * dx + py * dy) / lenSq;
}
