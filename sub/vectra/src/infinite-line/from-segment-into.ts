import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { InfiniteLineWritable, SegmentLike, XYWritable } from '../types';

/**
 * segment `a -> b`를 `origin = a`, `direction = b - a`로 `out`에 기록하고 `out`을 반환한다.
 *
 * zero-length segment는 degenerate infinite-line(direction = 0)이 된다.
 */
export function fromSegmentInto<Out extends InfiniteLineWritable<XYWritable, XYWritable>>(
  out: Out,
  line: SegmentLike
): Out {
  // alias 위험은 없지만 component 일관성을 위해 모든 좌표를 먼저 읽는다
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const bx = readX(readSegmentB(line));
  const by = readY(readSegmentB(line));
  writeXY(out.origin, ax, ay);
  writeXY(out.direction, bx - ax, by - ay);
  return out;
}
