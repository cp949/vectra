import type { Segment, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * segment를 원점 기준으로 CCW 회전한 결과를 out에 기록하고 out을 반환한다. input/output aliasing 허용.
 *
 * @param out 결과를 기록할 선분 객체
 * @param line 회전할 segment
 * @param angle 회전각(radian, CCW)
 */
export function rotateInto<Out extends SegmentWritable>(out: Out, line: Segment, angle: number): Out {
  // aliasing 안전: 모든 좌표를 먼저 읽는다
  const ax = line.x1;
  const ay = line.y1;
  const bx = line.x2;
  const by = line.y2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  out.x1 = ax * cos - ay * sin;
  out.y1 = ax * sin + ay * cos;
  out.x2 = bx * cos - by * sin;
  out.y2 = bx * sin + by * cos;
  return out;
}
