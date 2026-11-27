import type { CubicCurve, PointWritable } from '../types/flat-shapes.internal';

/**
 * cubic Bezier curve의 파라미터 t 위치 1차 도함수(velocity) vector를 out에 기록하고 out을 반환한다.
 *
 * 수식: B'(t) = 3[(1-t)²·(p1-p0) + 2(1-t)t·(p2-p1) + t²·(p3-p2)]
 * t는 clamp 없이 수식 그대로 계산한다.
 * 결과는 정규화되지 않은 raw derivative vector다.
 *
 * @param out 도함수 벡터를 기록할 점 객체
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function cubicDerivativeAtInto<Out extends PointWritable>(out: Out, curve: CubicCurve, t: number): Out {
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
  const t2 = t * t;
  const twoMtT = 2 * mt * t;

  out.x = 3 * (mt2 * (p1x - p0x) + twoMtT * (p2x - p1x) + t2 * (p3x - p2x));
  out.y = 3 * (mt2 * (p1y - p0y) + twoMtT * (p2y - p1y) + t2 * (p3y - p2y));
  return out;
}
