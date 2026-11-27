import type { CenterArc, PointWritable } from '../types/flat-shapes.internal';
import { angleAtT, ellipseDerivative, isDegenerateRadii } from './arc.internal';
import { hypot2 } from '../internal/numeric';

/**
 * center form arc 위의 파라미터 t 위치 unit tangent vector를 out에 기록하고 out을 반환한다.
 *
 * dP/dθ를 (endAngle - startAngle)로 chain-rule scaling한 dP/dt를 정규화한 unit vector를 반환한다.
 * sweep 방향(endAngle - startAngle의 부호)이 tangent 방향에 그대로 반영된다.
 * derivative가 zero vector이거나 degenerate arc이면 zero vector를 기록한다.
 *
 * zero-sweep arc(startAngle === endAngle)의 경우 sweepSign이 0이 되어 항상 zero vector를
 * 반환한다. 이는 의도된 spec이다. zero-length curve의 tangent는 정의할 수 없으므로
 * zero vector를 반환하고, caller가 필요에 따라 fallback 방향을 결정해야 한다.
 *
 * @param out 단위 접선 벡터를 기록할 점 객체
 * @param centerArc center form arc input
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 * @returns out
 */
export function arcTangentAtInto<Out extends PointWritable>(out: Out, centerArc: CenterArc, t: number): Out {
  const { rx, ry, xRotation, startAngle, endAngle } = centerArc;

  if (isDegenerateRadii(rx, ry)) {
    out.x = 0;
    out.y = 0;
    return out;
  }

  const theta = angleAtT(startAngle, endAngle, t);
  const derivative: [number, number] = [0, 0];
  ellipseDerivative(rx, ry, xRotation, theta, derivative);

  // chain rule: dP/dt = dP/dθ · (endAngle - startAngle)
  // sweep 방향에 따라 부호가 결정된다.
  const sweepSign = endAngle - startAngle;
  const dx = derivative[0] * sweepSign;
  const dy = derivative[1] * sweepSign;

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
