import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY, writeXY } from '../internal/xy';
import type { EllipseLike, RotatedEllipseWritable, XYWritable } from '../types';

/**
 * axis-aligned ellipse를 rotation을 더한 rotated ellipse로 out에 기록하고 out을 반환한다.
 *
 * center와 radiusX/radiusY는 그대로 복사하고 rotation은 받은 radian 값을 그대로 기록한다.
 * rotation은 standard CCW이며 normalization을 적용하지 않는다.
 * empty(radiusX <= 0 || radiusY <= 0)나 non-finite 입력은 보정 없이 그대로 전파한다.
 * input과 out이 같은 center를 alias해도 안전하다.
 *
 * @param out rotated ellipse를 기록할 writable output
 * @param ellipse 승급할 axis-aligned ellipse
 * @param rotation local x축 semi-axis의 회전각. radian, standard CCW
 */
export function toRotatedInto<Out extends RotatedEllipseWritable<XYWritable>>(
  out: Out,
  ellipse: EllipseLike,
  rotation: number
): Out {
  // aliasing 안전: out에 기록하기 전에 입력을 local로 읽는다
  const center = readEllipseCenter(ellipse);
  const cx = readX(center);
  const cy = readY(center);
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);
  writeXY(out.center, cx, cy);
  out.radiusX = rx;
  out.radiusY = ry;
  out.rotation = rotation;
  return out;
}
