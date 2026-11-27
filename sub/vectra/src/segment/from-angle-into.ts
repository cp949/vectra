import type { Point, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * origin에서 angle 방향으로 length 길이의 segment을 out에 기록하고 out을 반환한다.
 *
 * @param out 결과를 기록할 선분 객체
 * @param origin 시작점
 * @param angle 방향각(radian)
 * @param length 선분 길이. 0이면 zero-length segment을 기록한다
 */
export function fromAngleInto<Out extends SegmentWritable>(
  out: Out,
  origin: Point,
  angle: number,
  length: number
): Out {
  const ox = origin.x;
  const oy = origin.y;
  out.x1 = ox;
  out.y1 = oy;
  out.x2 = ox + Math.cos(angle) * length;
  out.y2 = oy + Math.sin(angle) * length;
  return out;
}
