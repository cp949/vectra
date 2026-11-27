import type { InfiniteLine, Point } from '../types/flat-shapes.internal';

/**
 * infinite-line과 `point` 사이 최단 거리의 제곱을 반환한다.
 *
 * degenerate infinite-line(`directionLengthSq === 0`)에서는 origin-point 거리의 제곱을 반환한다.
 */
export function distanceToPointSq(line: InfiniteLine, point: Point): number {
  const { ox, oy, dx, dy } = line;
  const lenSq = dx * dx + dy * dy;
  const px = point.x - ox;
  const py = point.y - oy;
  if (lenSq === 0) return px * px + py * py;
  // unclamped foot-of-perpendicular까지의 거리 제곱
  const t = (px * dx + py * dy) / lenSq;
  const cx = t * dx - px;
  const cy = t * dy - py;
  return cx * cx + cy * cy;
}
