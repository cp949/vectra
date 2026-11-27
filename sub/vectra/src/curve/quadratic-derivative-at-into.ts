import type { QuadraticCurve, PointWritable } from '../types/flat-shapes.internal';

/**
 * quadratic Bezier curve의 파라미터 t 위치 1차 도함수(velocity) vector를 out에 기록하고 out을 반환한다.
 *
 * 수식: B'(t) = 2(1-t)·(p1-p0) + 2t·(p2-p1)
 * t는 clamp 없이 수식 그대로 계산한다.
 * 결과는 정규화되지 않은 raw derivative vector다.
 *
 * @param out derivative vector를 기록할 writable output
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function quadraticDerivativeAtInto<Out extends PointWritable>(out: Out, curve: QuadraticCurve, t: number): Out {
  const p0x = curve.x0;
  const p0y = curve.y0;
  const p1x = curve.x1;
  const p1y = curve.y1;
  const p2x = curve.x2;
  const p2y = curve.y2;

  const twoMt = 2 * (1 - t);
  const twoT = 2 * t;

  out.x = twoMt * (p1x - p0x) + twoT * (p2x - p1x);
  out.y = twoMt * (p1y - p0y) + twoT * (p2y - p1y);
  return out;
}
