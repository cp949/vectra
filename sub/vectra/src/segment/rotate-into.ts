import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, SegmentWritable, XYWritable } from '../types';

/**
 * segment를 원점 기준으로 CCW 회전한 결과를 out에 기록하고 out을 반환한다. input/output aliasing 허용.
 *
 * @param out 결과를 기록할 writable segment output
 * @param line 회전할 segment
 * @param angle 회전각(radian, CCW)
 */
export function rotateInto<Out extends SegmentWritable<XYWritable, XYWritable>>(
  out: Out,
  line: SegmentLike,
  angle: number
): Out {
  // aliasing 안전: 모든 좌표를 먼저 읽는다
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const bx = readX(readSegmentB(line));
  const by = readY(readSegmentB(line));
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  writeXY(out.a, ax * cos - ay * sin, ax * sin + ay * cos);
  writeXY(out.b, bx * cos - by * sin, bx * sin + by * cos);
  return out;
}
