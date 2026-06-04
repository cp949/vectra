import { readInfiniteLineDirection } from '../internal/infinite-line';
import { readX, readY, writeXY } from '../internal/xy';
import type { InfiniteLineLike, XYWritable } from '../types';

/** infinite-line의 direction vector를 `out`에 기록하고 `out`을 반환한다. */
export function directionInto<Out extends XYWritable>(out: Out, line: InfiniteLineLike): Out {
  const d = readInfiniteLineDirection(line);
  return writeXY(out, readX(d), readY(d));
}
