import { writeXY } from '../internal/xy';
import type { CenterArcLike, XYWritable } from '../types';
import { angleAtT, ellipsePoint, isDegenerateRadii } from './arc.internal';

/**
 * center form arc 위의 파라미터 t 위치 point를 out에 기록하고 out을 반환한다.
 *
 * t는 startAngle(0)과 endAngle(1)을 선형 보간한 angle 위치다. clamp 없이 외삽을 허용한다.
 * rx <= 0 또는 ry <= 0인 degenerate arc는 center 좌표를 반환한다.
 *
 * @param out point를 기록할 writable output
 * @param centerArc center form arc input
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 * @returns out
 */
export function arcPointAtTInto<Out extends XYWritable>(out: Out, centerArc: CenterArcLike, t: number): Out {
  const { cx, cy, rx, ry, xRotation, startAngle, endAngle } = centerArc;

  if (isDegenerateRadii(rx, ry)) {
    return writeXY(out, cx, cy);
  }

  const theta = angleAtT(startAngle, endAngle, t);
  const point: [number, number] = [0, 0];
  ellipsePoint(cx, cy, rx, ry, xRotation, theta, point);
  return writeXY(out, point[0], point[1]);
}
