import type { Point, Segment, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * segment을 center 기준으로 CCW 회전하여 out에 기록하고 out을 반환한다. input/output aliasing 허용.
 *
 * @param out 결과를 기록할 선분 객체
 * @param line 회전할 segment
 * @param center 회전 중심점
 * @param angle 회전각(radian, CCW)
 */
export function rotateAroundInto<Out extends SegmentWritable>(
  out: Out,
  line: Segment,
  center: Point,
  angle: number
): Out {
  // rotateAroundInto(seg, seg, ...) alias 호출에서도 안전하도록 모든 좌표를 먼저 읽는다
  const ax = line.x1;
  const ay = line.y1;
  const bx = line.x2;
  const by = line.y2;
  const cx = center.x;
  const cy = center.y;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // center 기준 CCW 회전: p' = center + R * (p - center)
  const adx = ax - cx;
  const ady = ay - cy;
  out.x1 = cx + adx * cos - ady * sin;
  out.y1 = cy + adx * sin + ady * cos;

  const bdx = bx - cx;
  const bdy = by - cy;
  out.x2 = cx + bdx * cos - bdy * sin;
  out.y2 = cy + bdx * sin + bdy * cos;

  return out;
}
