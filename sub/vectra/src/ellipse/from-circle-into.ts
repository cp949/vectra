import type { Circle, EllipseWritable } from '../types/flat-shapes.internal';

/**
 * circle을 axis-aligned ellipse로 upcast해 out에 기록하고 out을 반환한다.
 *
 * `out.cx = circle.cx`, `out.cy = circle.cy`, `out.rx = out.ry = circle.r`로 기록한다.
 * `circle.r <= 0`이어도 empty 여부 보정 없이 그대로 기록한다.
 * non-finite center 좌표와 radius는 별도 검증 없이 그대로 전파한다.
 * 입력과 출력이 같은 객체여도 안전하다.
 *
 * @param out ellipse를 기록할 객체
 * @param circle ellipse로 upcast할 circle
 */
export function fromCircleInto<Out extends EllipseWritable>(out: Out, circle: Circle): Out {
  const cx = circle.cx;
  const cy = circle.cy;
  const r = circle.r;
  out.cx = cx;
  out.cy = cy;
  out.rx = r;
  out.ry = r;
  return out;
}
