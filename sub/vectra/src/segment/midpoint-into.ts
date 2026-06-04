import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, XYWritable } from '../types';

/**
 * (a + b) / 2 중점을 out에 기록하고 out을 반환한다.
 *
 * @param out 중점을 기록할 writable output
 * @param line 대상 segment
 */
export function midpointInto<Out extends XYWritable>(out: Out, line: SegmentLike): Out {
  const mx = (readX(readSegmentA(line)) + readX(readSegmentB(line))) * 0.5;
  const my = (readY(readSegmentA(line)) + readY(readSegmentB(line))) * 0.5;
  return writeXY(out, mx, my);
}
