import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { readX, readY, writeXY } from '../internal/xy';
import type { InfiniteLineLike, XYInput, XYWritable } from '../types';

/**
 * `point`에서 infinite-line으로 내린 수선의 발을 `out`에 기록하고 `out`을 반환한다.
 *
 * degenerate infinite-line(`directionLengthSq === 0`)에서는 origin을 기록한다.
 */
export function projectPointInto<Out extends XYWritable>(out: Out, line: InfiniteLineLike, point: XYInput): Out {
  const ox = readX(readInfiniteLineOrigin(line));
  const oy = readY(readInfiniteLineOrigin(line));
  const dx = readX(readInfiniteLineDirection(line));
  const dy = readY(readInfiniteLineDirection(line));
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return writeXY(out, ox, oy);
  const px = readX(point) - ox;
  const py = readY(point) - oy;
  const t = (px * dx + py * dy) / lenSq;
  return writeXY(out, ox + t * dx, oy + t * dy);
}
