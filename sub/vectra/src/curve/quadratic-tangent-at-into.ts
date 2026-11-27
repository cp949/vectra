import type { QuadraticCurve, PointWritable } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * quadratic Bezier curve의 파라미터 t 위치 unit tangent vector를 out에 기록하고 out을 반환한다.
 *
 * derivative를 정규화한 unit vector를 반환한다.
 * derivative가 zero vector인 경우(degenerate curve 등) zero vector를 기록한다.
 * caller가 zero vector를 처리할 책임이 있다. vectra는 임의 방향을 주입하지 않는다.
 * t는 clamp 없이 수식 그대로 계산한다.
 *
 * @param out unit tangent vector를 기록할 writable output
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function quadraticTangentAtInto<Out extends PointWritable>(out: Out, curve: QuadraticCurve, t: number): Out {
  const p0x = curve.x0;
  const p0y = curve.y0;
  const p1x = curve.x1;
  const p1y = curve.y1;
  const p2x = curve.x2;
  const p2y = curve.y2;

  const twoMt = 2 * (1 - t);
  const twoT = 2 * t;

  const dx = twoMt * (p1x - p0x) + twoT * (p2x - p1x);
  const dy = twoMt * (p1y - p0y) + twoT * (p2y - p1y);

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
