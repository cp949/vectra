import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, XYWritable } from '../types';

/**
 * a + t * (b - a) 위치를 unclamped로 out에 기록하고 out을 반환한다.
 *
 * @param out 위치를 기록할 writable output
 * @param line 대상 segment
 * @param t parametric 위치. [0, 1] 밖의 값도 clamp 없이 그대로 계산한다
 */
export function pointAtTInto<Out extends XYWritable>(out: Out, line: SegmentLike, t: number): Out {
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const dx = readX(readSegmentB(line)) - ax;
  const dy = readY(readSegmentB(line)) - ay;
  return writeXY(out, ax + t * dx, ay + t * dy);
}
