import type { Ellipse, RotatedEllipseWritable } from '../types/flat-shapes.internal';

/**
 * axis-aligned ellipse를 rotation을 더한 rotated ellipse로 out에 기록하고 out을 반환한다.
 *
 * center와 rx/ry는 그대로 복사하고 rotation은 받은 radian 값을 그대로 기록한다.
 * rotation은 standard CCW이며 normalization을 적용하지 않는다.
 * empty(rx <= 0 || ry <= 0)나 non-finite 입력은 보정 없이 그대로 전파한다.
 * 입력과 출력이 같은 객체여도 안전하다.
 *
 * @param out 결과를 기록할 회전 타원 객체
 * @param ellipse 승급할 axis-aligned ellipse
 * @param rotation local x축 semi-axis의 회전각. radian, standard CCW
 */
export function toRotatedInto<Out extends RotatedEllipseWritable>(out: Out, ellipse: Ellipse, rotation: number): Out {
  // aliasing 안전: out에 기록하기 전에 입력을 local로 읽는다
  const { cx, cy, rx, ry } = ellipse;
  out.cx = cx;
  out.cy = cy;
  out.rx = rx;
  out.ry = ry;
  out.rotation = rotation;
  return out;
}
