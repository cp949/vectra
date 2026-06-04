import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, XYInput } from '../types';

/**
 * infinite-line과 `point` 사이 최단 거리의 제곱을 반환한다.
 *
 * degenerate infinite-line(`directionLengthSq === 0`)에서는 origin-point 거리의 제곱을 반환한다.
 */
export function distanceToPointSq(line: InfiniteLineLike, point: XYInput): number {
  const ox = readX(readInfiniteLineOrigin(line));
  const oy = readY(readInfiniteLineOrigin(line));
  const dx = readX(readInfiniteLineDirection(line));
  const dy = readY(readInfiniteLineDirection(line));
  const lenSq = dx * dx + dy * dy;
  const px = readX(point) - ox;
  const py = readY(point) - oy;
  if (lenSq === 0) return px * px + py * py;
  // unclamped foot-of-perpendicular까지의 거리 제곱
  const t = (px * dx + py * dy) / lenSq;
  const cx = t * dx - px;
  const cy = t * dy - py;
  return cx * cx + cy * cy;
}
