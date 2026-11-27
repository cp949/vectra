import type { CubicCurveWritable, QuadraticCurve } from '../types/flat-shapes.internal';

/**
 * quadratic Bezier curve를 동등한 cubic Bezier curve로 정확하게 변환하여 out에 기록하고 out을 반환한다.
 *
 * degree elevation 공식:
 * ```
 * c0 = p0
 * c1 = p0 + (2/3)*(p1 - p0)
 * c2 = p2 + (2/3)*(p1 - p2)
 * c3 = p2
 * ```
 *
 * aliasing 안전: 입력을 모두 읽은 후 출력에 기록한다.
 * 변환 후 cubic curve는 원본 quadratic curve와 모든 파라미터 t에서 동일한 point를 반환한다.
 *
 * @param out 결과를 기록할 삼차 베지어 객체
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 */
export function quadraticElevateToCubicInto<Out extends CubicCurveWritable>(out: Out, curve: QuadraticCurve): Out {
  // aliasing 안전을 위해 입력을 모두 먼저 읽는다
  const p0x = curve.x0;
  const p0y = curve.y0;
  const p1x = curve.x1;
  const p1y = curve.y1;
  const p2x = curve.x2;
  const p2y = curve.y2;

  // degree elevation: quadratic → cubic
  const c1x = p0x + (2 / 3) * (p1x - p0x);
  const c1y = p0y + (2 / 3) * (p1y - p0y);
  const c2x = p2x + (2 / 3) * (p1x - p2x);
  const c2y = p2y + (2 / 3) * (p1y - p2y);

  out.x0 = p0x;
  out.y0 = p0y;
  out.x1 = c1x;
  out.y1 = c1y;
  out.x2 = c2x;
  out.y2 = c2y;
  out.x3 = p2x;
  out.y3 = p2y;

  return out;
}
