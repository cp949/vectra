import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, SegmentWritable, XYInput, XYWritable } from '../types';

/**
 * segment을 center 기준으로 CCW 회전하여 out에 기록하고 out을 반환한다. input/output aliasing 허용.
 *
 * @param out 결과를 기록할 writable segment output
 * @param line 회전할 segment
 * @param center 회전 중심점
 * @param angle 회전각(radian, CCW)
 */
export function rotateAroundInto<Out extends SegmentWritable<XYWritable, XYWritable>>(
  out: Out,
  line: SegmentLike,
  center: XYInput,
  angle: number
): Out {
  // rotateAroundInto(seg, seg, ...) alias 호출에서도 안전하도록 모든 좌표를 먼저 읽는다
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const bx = readX(readSegmentB(line));
  const by = readY(readSegmentB(line));
  const cx = readX(center);
  const cy = readY(center);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // center 기준 CCW 회전: p' = center + R * (p - center)
  const adx = ax - cx;
  const ady = ay - cy;
  writeXY(out.a, cx + adx * cos - ady * sin, cy + adx * sin + ady * cos);

  const bdx = bx - cx;
  const bdy = by - cy;
  writeXY(out.b, cx + bdx * cos - bdy * sin, cy + bdx * sin + bdy * cos);

  return out;
}
