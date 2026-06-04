import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY, writeXY } from '../internal/xy';
import type { CircleLike, SegmentWritable, XYWritable } from '../types';

/**
 * circle의 diameter segment를 angle 방향으로 out에 기록하고 out을 반환한다.
 *
 * direction = (cos(angle), sin(angle)).
 * radius > 0이면 a = center - direction * radius, b = center + direction * radius.
 * radius <= 0이면 zero-length segment a = b = center를 기록한다.
 * NaN/Infinity 입력은 별도 검증 없이 JavaScript 산술 결과를 따른다.
 * out.a 또는 out.b와 circle.center가 같은 storage여도 aliasing이 안전하다.
 *
 * @param out 결과를 기록할 writable segment output
 * @param circle diameter의 기준이 되는 circle input
 * @param angle diameter 방향각(radian). 기본값 0은 horizontal diameter
 */
export function fromCircleInto<Out extends SegmentWritable<XYWritable, XYWritable>>(
  out: Out,
  circle: CircleLike,
  angle = 0
): Out {
  const center = readCircleCenter(circle);
  const cx = readX(center);
  const cy = readY(center);
  const r = readCircleRadius(circle);
  if (r <= 0) {
    writeXY(out.a, cx, cy);
    writeXY(out.b, cx, cy);
  } else {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    writeXY(out.a, cx - dx * r, cy - dy * r);
    writeXY(out.b, cx + dx * r, cy + dy * r);
  }
  return out;
}
