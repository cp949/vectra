import { readSegmentA } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, XYWritable } from '../types';

/**
 * segment 시작점을 out에 기록하고 out을 반환한다.
 *
 * @param out 시작점을 기록할 writable output
 * @param line 대상 segment
 */
export function startInto<Out extends XYWritable>(out: Out, line: SegmentLike): Out {
  const a = readSegmentA(line);
  return writeXY(out, readX(a), readY(a));
}
