import { readInfiniteLineOrigin } from '../internal/infinite-line';
import { readX, readY, writeXY } from '../internal/xy';
import type { InfiniteLineLike, XYWritable } from '../types';

/** infinite-line의 origin point를 `out`에 기록하고 `out`을 반환한다. */
export function originInto<Out extends XYWritable>(out: Out, line: InfiniteLineLike): Out {
  const o = readInfiniteLineOrigin(line);
  return writeXY(out, readX(o), readY(o));
}
