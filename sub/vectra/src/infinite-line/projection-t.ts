import type { InfiniteLine, Point } from '../types/flat-shapes.internal';

/**
 * `point`의 infinite-line 위 parametric 위치 `t`를 unclamped로 반환한다.
 *
 * degenerate infinite-line(`directionLengthSq === 0`)에서는 `0`을 반환한다.
 * division-by-zero guard 외에는 epsilon 비교를 하지 않는다.
 */
export function projectionT(line: InfiniteLine, point: Point): number {
  const { ox, oy, dx, dy } = line;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return 0;
  const px = point.x - ox;
  const py = point.y - oy;
  return (px * dx + py * dy) / lenSq;
}
