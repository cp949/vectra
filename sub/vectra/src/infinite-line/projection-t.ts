import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, XYInput } from '../types';

/**
 * `point`의 infinite-line 위 parametric 위치 `t`를 unclamped로 반환한다.
 *
 * degenerate infinite-line(`directionLengthSq === 0`)에서는 `0`을 반환한다.
 * division-by-zero guard 외에는 epsilon 비교를 하지 않는다.
 */
export function projectionT(line: InfiniteLineLike, point: XYInput): number {
  const ox = readX(readInfiniteLineOrigin(line));
  const oy = readY(readInfiniteLineOrigin(line));
  const dx = readX(readInfiniteLineDirection(line));
  const dy = readY(readInfiniteLineDirection(line));
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return 0;
  const px = readX(point) - ox;
  const py = readY(point) - oy;
  return (px * dx + py * dy) / lenSq;
}
