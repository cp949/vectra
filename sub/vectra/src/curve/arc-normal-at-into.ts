import type { CenterArc, PointWritable } from '../types/flat-shapes.internal';
import { angleAtT, ellipseDerivative, isDegenerateRadii } from './arc.internal';
import { hypot2 } from '../internal/numeric';

/**
 * center form arc 위의 파라미터 t 위치 unit normal vector를 out에 기록하고 out을 반환한다.
 *
 * unit tangent를 좌측 90° 회전한 벡터 (-ty, tx)를 반환한다.
 * degenerate arc 또는 zero-sweep arc에서 tangent가 zero vector이면 zero vector를 기록한다.
 *
 * @param out 단위 법선 벡터를 기록할 점 객체
 * @param centerArc center form arc input
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 * @returns out
 */
export function arcNormalAtInto<Out extends PointWritable>(out: Out, centerArc: CenterArc, t: number): Out {
  const { rx, ry, xRotation, startAngle, endAngle } = centerArc;

  if (isDegenerateRadii(rx, ry)) {
    out.x = 0;
    out.y = 0;
    return out;
  }

  const theta = angleAtT(startAngle, endAngle, t);
  const deriv: [number, number] = [0, 0];
  ellipseDerivative(rx, ry, xRotation, theta, deriv);

  // chain rule: dP/dt = dP/dθ · (endAngle - startAngle)
  const sweepSign = endAngle - startAngle;
  const dx = deriv[0] * sweepSign;
  const dy = deriv[1] * sweepSign;

  const len = hypot2(dx, dy);
  if (len === 0) {
    out.x = 0;
    out.y = 0;
    return out;
  }

  // 좌측 90° 회전: (-ty, tx)
  out.x = -dy / len;
  out.y = dx / len;
  return out;
}
