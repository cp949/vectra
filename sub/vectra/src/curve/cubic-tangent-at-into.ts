import type { CubicCurve, PointWritable } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * cubic Bezier curve의 파라미터 t 위치 unit tangent vector를 out에 기록하고 out을 반환한다.
 *
 * 1차 도함수를 정규화한 unit vector를 반환한다.
 * derivative가 zero vector인 경우(degenerate curve 등) zero vector를 기록한다.
 * caller가 zero vector를 처리할 책임이 있다. vectra는 임의 방향을 주입하지 않는다.
 * t는 clamp 없이 수식 그대로 계산한다.
 *
 * @param out 단위 접선 벡터를 기록할 점 객체
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function cubicTangentAtInto<Out extends PointWritable>(out: Out, curve: CubicCurve, t: number): Out {
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

  const dx = 3 * (mt2 * (p1x - p0x) + twoMtT * (p2x - p1x) + t2 * (p3x - p2x));
  const dy = 3 * (mt2 * (p1y - p0y) + twoMtT * (p2y - p1y) + t2 * (p3y - p2y));

  const len = hypot2(dx, dy);

  if (len === 0) {
    out.x = 0;
    out.y = 0;
    return out;
  }

  out.x = dx / len;
  out.y = dy / len;
  return out;
}
