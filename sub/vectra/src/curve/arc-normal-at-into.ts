import { writeXY } from '../internal/xy';
import type { CenterArcLike, XYWritable } from '../types';
import { angleAtT, ellipseDerivative, isDegenerateRadii } from './arc.internal';

/**
 * center form arc 위의 파라미터 t 위치 unit normal vector를 out에 기록하고 out을 반환한다.
 *
 * unit tangent를 좌측 90° 회전한 벡터 (-ty, tx)를 반환한다.
 * degenerate arc 또는 zero-sweep arc에서 tangent가 zero vector이면 zero vector를 기록한다.
 *
 * @param out unit normal vector를 기록할 writable output
 * @param centerArc center form arc input
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 * @returns out
 */
export function arcNormalAtInto<Out extends XYWritable>(out: Out, centerArc: CenterArcLike, t: number): Out {
  const { rx, ry, xRotation, startAngle, endAngle } = centerArc;

  if (isDegenerateRadii(rx, ry)) {
    return writeXY(out, 0, 0);
  }

  const theta = angleAtT(startAngle, endAngle, t);
  const deriv: [number, number] = [0, 0];
  ellipseDerivative(rx, ry, xRotation, theta, deriv);

  // chain rule: dP/dt = dP/dθ · (endAngle - startAngle)
  const sweepSign = endAngle - startAngle;
  const dx = deriv[0] * sweepSign;
  const dy = deriv[1] * sweepSign;

  const len = Math.hypot(dx, dy);
  if (len === 0) {
    return writeXY(out, 0, 0);
  }

  // 좌측 90° 회전: (-ty, tx)
  return writeXY(out, -dy / len, dx / len);
}
