import type { Circle, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * circle의 diameter segment를 angle 방향으로 out에 기록하고 out을 반환한다.
 *
 * direction = (cos(angle), sin(angle)).
 * radius > 0이면 a = center - direction * radius, b = center + direction * radius.
 * radius <= 0이면 zero-length segment a = b = center를 기록한다.
 * NaN/Infinity 입력은 별도 검증 없이 JavaScript 산술 결과를 따른다.
 * 중심 좌표와 반지름을 읽은 뒤 결과를 기록한다.
 *
 * @param out 결과를 기록할 선분 객체
 * @param circle diameter의 기준이 되는 circle input
 * @param angle diameter 방향각(radian). 기본값 0은 horizontal diameter
 */
export function fromCircleInto<Out extends SegmentWritable>(out: Out, circle: Circle, angle = 0): Out {
  const cx = circle.cx;
  const cy = circle.cy;
  const r = circle.r;
  if (r <= 0) {
    out.x1 = cx;
    out.y1 = cy;
    out.x2 = cx;
    out.y2 = cy;
  } else {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    out.x1 = cx - dx * r;
    out.y1 = cy - dy * r;
    out.x2 = cx + dx * r;
    out.y2 = cy + dy * r;
  }
  return out;
}
