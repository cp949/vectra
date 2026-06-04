import { readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, XYWritable } from '../types';

/**
 * segment 끝점을 out에 기록하고 out을 반환한다.
 *
 * @param out 끝점을 기록할 writable output
 * @param line 대상 segment
 */
export function endInto<Out extends XYWritable>(out: Out, line: SegmentLike): Out {
  const b = readSegmentB(line);
  return writeXY(out, readX(b), readY(b));
}
