import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, XYInput } from '../types';

/**
 * infinite-line과 `point` 사이 최단 거리를 반환한다.
 *
 * degenerate infinite-line(`directionLengthSq === 0`)에서는 origin-point 거리를 반환한다.
 */
export function distanceToPoint(line: InfiniteLineLike, point: XYInput): number {
  const ox = readX(readInfiniteLineOrigin(line));
  const oy = readY(readInfiniteLineOrigin(line));
  const dx = readX(readInfiniteLineDirection(line));
  const dy = readY(readInfiniteLineDirection(line));
  const lenSq = dx * dx + dy * dy;
  const px = readX(point) - ox;
  const py = readY(point) - oy;
  if (lenSq === 0) return Math.hypot(px, py);
  const t = (px * dx + py * dy) / lenSq;
  const cx = t * dx - px;
  const cy = t * dy - py;
  return Math.hypot(cx, cy);
}
