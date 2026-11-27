import type { InfiniteLine, Point } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * infinite-line과 `point` 사이 최단 거리를 반환한다.
 *
 * degenerate infinite-line(`directionLengthSq === 0`)에서는 origin-point 거리를 반환한다.
 */
export function distanceToPoint(line: InfiniteLine, point: Point): number {
  const { ox, oy, dx, dy } = line;
  const lenSq = dx * dx + dy * dy;
  const px = point.x - ox;
  const py = point.y - oy;
  if (lenSq === 0) return hypot2(px, py);
  const t = (px * dx + py * dy) / lenSq;
  const cx = t * dx - px;
  const cy = t * dy - py;
  return hypot2(cx, cy);
}
