import type { CubicCurve, PointWritable } from '../types/flat-shapes.internal';

/**
 * cubic Bezier curve 위의 파라미터 t 위치 point를 out에 기록하고 out을 반환한다.
 *
 * 수식: B(t) = (1-t)³·p0 + 3(1-t)²t·p1 + 3(1-t)t²·p2 + t³·p3
 * t는 clamp 없이 수식 그대로 계산한다.
 *
 * @param out 결과를 기록할 점 객체
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function cubicPointAtTInto<Out extends PointWritable>(out: Out, curve: CubicCurve, t: number): Out {
  const p0x = curve.x0;
  const p0y = curve.y0;
  const p1x = curve.x1;
  const p1y = curve.y1;
  const p2x = curve.x2;
  const p2y = curve.y2;
  const p3x = curve.x3;
  const p3y = curve.y3;

  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  const threeMt2T = 3 * mt2 * t;
  const threeMtT2 = 3 * mt * t2;

  out.x = mt3 * p0x + threeMt2T * p1x + threeMtT2 * p2x + t3 * p3x;
  out.y = mt3 * p0y + threeMt2T * p1y + threeMtT2 * p2y + t3 * p3y;
  return out;
}
