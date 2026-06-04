import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentWritable, XYInput, XYWritable } from '../types';

/**
 * origin에서 angle 방향으로 length 길이의 segment을 out에 기록하고 out을 반환한다.
 *
 * @param out 결과를 기록할 writable segment output
 * @param origin 시작점
 * @param angle 방향각(radian)
 * @param length 선분 길이. 0이면 zero-length segment을 기록한다
 */
export function fromAngleInto<Out extends SegmentWritable<XYWritable, XYWritable>>(
  out: Out,
  origin: XYInput,
  angle: number,
  length: number
): Out {
  const ox = readX(origin);
  const oy = readY(origin);
  writeXY(out.a, ox, oy);
  writeXY(out.b, ox + Math.cos(angle) * length, oy + Math.sin(angle) * length);
  return out;
}
