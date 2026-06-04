import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY, writeXY } from '../internal/xy';
import type { CircleLike, EllipseWritable, XYWritable } from '../types';

/**
 * circle을 axis-aligned ellipse로 upcast해 out에 기록하고 out을 반환한다.
 *
 * `out.center = circle.center`, `out.radiusX = out.radiusY = circle.radius`로 기록한다.
 * `circle.radius <= 0`이어도 empty 여부 보정 없이 그대로 기록한다.
 * non-finite center 좌표와 radius는 별도 검증 없이 그대로 전파한다.
 * `out.center`가 `circle.center`와 alias되어도 안전하다.
 *
 * @param out ellipse를 기록할 writable output
 * @param circle ellipse로 upcast할 circle
 */
export function fromCircleInto<Out extends EllipseWritable<XYWritable>>(out: Out, circle: CircleLike): Out {
  const cx = readX(readCircleCenter(circle));
  const cy = readY(readCircleCenter(circle));
  const r = readCircleRadius(circle);
  writeXY(out.center, cx, cy);
  out.radiusX = r;
  out.radiusY = r;
  return out;
}
