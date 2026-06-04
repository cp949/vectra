import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { readX, readY, writeXY } from '../internal/xy';
import type { InfiniteLineLike, XYWritable } from '../types';

/**
 * `origin + direction * t` 위치를 `out`에 기록하고 `out`을 반환한다.
 *
 * `t`는 clamp하지 않는다. degenerate infinite-line(direction = 0)에서는 `t`에 무관하게 origin을 기록한다.
 */
export function pointAtTInto<Out extends XYWritable>(out: Out, line: InfiniteLineLike, t: number): Out {
  const ox = readX(readInfiniteLineOrigin(line));
  const oy = readY(readInfiniteLineOrigin(line));
  const dx = readX(readInfiniteLineDirection(line));
  const dy = readY(readInfiniteLineDirection(line));
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return writeXY(out, ox, oy);
  return writeXY(out, ox + t * dx, oy + t * dy);
}
