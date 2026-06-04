import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsWritable, SegmentLike, XYWritable } from '../types';

/**
 * segment 양 endpoint의 axis-aligned bounding box를 out에 기록하고 out을 반환한다.
 *
 * non-finite endpoint는 IEEE 754 전파 규칙을 따른다.
 * zero-length segment는 점으로 수렴한 bounds(min === max)를 기록한다(inverted 아님).
 *
 * @param out bounding box를 기록할 writable output
 * @param line 대상 segment
 */
export function boundsInto<Out extends BoundsWritable<XYWritable, XYWritable>>(out: Out, line: SegmentLike): Out {
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const bx = readX(readSegmentB(line));
  const by = readY(readSegmentB(line));
  writeXY(out.min, Math.min(ax, bx), Math.min(ay, by));
  writeXY(out.max, Math.max(ax, bx), Math.max(ay, by));
  return out;
}
