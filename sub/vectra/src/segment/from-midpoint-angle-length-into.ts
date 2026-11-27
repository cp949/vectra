import type { Point, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * midpoint를 중심으로 angle 방향을 따라 length 길이의 segment를 out에 기록하고 out을 반환한다.
 *
 * direction = (cos(angle), sin(angle)), half = length / 2.
 * a = midpoint - direction * half, b = midpoint + direction * half.
 * length = 0이면 midpoint에 zero-length segment를 기록한다.
 * negative length는 clamp하지 않는다. endpoint가 angle 반대 방향으로 뒤집히는 JavaScript 산술 결과를 따른다.
 * NaN/Infinity 입력은 별도 검증 없이 JavaScript 산술 결과를 따른다. angle = Infinity이면 cos/sin 결과가 NaN이다.
 * 중점의 두 좌표를 읽은 뒤 결과를 기록한다.
 *
 * @param out 결과를 기록할 선분 객체
 * @param midpoint segment 중심점
 * @param angle segment 방향각(radian)
 * @param length segment 전체 길이. 0이면 midpoint zero-length segment를 기록한다. 음수는 clamp하지 않는다
 */
export function fromMidpointAngleLengthInto<Out extends SegmentWritable>(
  out: Out,
  midpoint: Point,
  angle: number,
  length: number
): Out {
  const mx = midpoint.x;
  const my = midpoint.y;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const half = length / 2;
  out.x1 = mx - dx * half;
  out.y1 = my - dy * half;
  out.x2 = mx + dx * half;
  out.y2 = my + dy * half;
  return out;
}
