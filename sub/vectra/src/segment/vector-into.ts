import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, XYWritable } from '../types';

/**
 * b - a 벡터를 out에 기록하고 out을 반환한다.
 *
 * @param out 벡터를 기록할 writable output
 * @param line 대상 segment
 */
export function vectorInto<Out extends XYWritable>(out: Out, line: SegmentLike): Out {
  const dx = readX(readSegmentB(line)) - readX(readSegmentA(line));
  const dy = readY(readSegmentB(line)) - readY(readSegmentA(line));
  return writeXY(out, dx, dy);
}
