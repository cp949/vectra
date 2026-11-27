import type { QuadraticCurve, PointWritable } from '../types/flat-shapes.internal';

/**
 * quadratic Bezier curve 위의 파라미터 t 위치 point를 out에 기록하고 out을 반환한다.
 *
 * 수식: B(t) = (1-t)²·p0 + 2(1-t)t·p1 + t²·p2
 * t는 clamp 없이 수식 그대로 계산한다. `t < 0` 또는 `t > 1`이면 외삽(extrapolation) 결과가 된다.
 *
 * @param out 결과를 기록할 점 객체
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function quadraticPointAtTInto<Out extends PointWritable>(out: Out, curve: QuadraticCurve, t: number): Out {
  const p0x = curve.x0;
  const p0y = curve.y0;
  const p1x = curve.x1;
  const p1y = curve.y1;
  const p2x = curve.x2;
  const p2y = curve.y2;

  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  const twoMtT = 2 * mt * t;

  out.x = mt2 * p0x + twoMtT * p1x + t2 * p2x;
  out.y = mt2 * p0y + twoMtT * p1y + t2 * p2y;
  return out;
}
