import type { CubicCurve, PointWritable } from '../types/flat-shapes.internal';

/**
 * cubic Bezier curve의 파라미터 t 위치 2차 도함수(acceleration) vector를 out에 기록하고 out을 반환한다.
 *
 * 수식: B''(t) = 6[(1-t)·(p2-2p1+p0) + t·(p3-2p2+p1)]
 * t는 clamp 없이 수식 그대로 계산한다.
 *
 * @param out 2차 도함수 벡터를 기록할 점 객체
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function cubicSecondDerivativeAtInto<Out extends PointWritable>(out: Out, curve: CubicCurve, t: number): Out {
  const p0x = curve.x0;
  const p0y = curve.y0;
  const p1x = curve.x1;
  const p1y = curve.y1;
  const p2x = curve.x2;
  const p2y = curve.y2;
  const p3x = curve.x3;
  const p3y = curve.y3;

  const mt = 1 - t;

  out.x = 6 * (mt * (p2x - 2 * p1x + p0x) + t * (p3x - 2 * p2x + p1x));
  out.y = 6 * (mt * (p2y - 2 * p1y + p0y) + t * (p3y - 2 * p2y + p1y));
  return out;
}
