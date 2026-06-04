import { writeXY } from '../internal/xy';
import type { CenterArcLike, XYWritable } from '../types';
import { angleAtT, ellipsePoint, isDegenerateRadii } from './arc.internal';

/**
 * center form arc의 중점(t=0.5) 좌표를 out에 기록하고 out을 반환한다.
 *
 * @param out 중점을 기록할 writable output
 * @param centerArc center form arc input
 * @returns out
 */
export function arcMiddleInto<Out extends XYWritable>(out: Out, centerArc: CenterArcLike): Out {
  const { cx, cy, rx, ry, xRotation, startAngle, endAngle } = centerArc;

  if (isDegenerateRadii(rx, ry)) {
    return writeXY(out, cx, cy);
  }

  const theta = angleAtT(startAngle, endAngle, 0.5);
  const pt: [number, number] = [0, 0];
  ellipsePoint(cx, cy, rx, ry, xRotation, theta, pt);
  return writeXY(out, pt[0], pt[1]);
}
