import type { CenterArc, PointWritable } from '../types/flat-shapes.internal';
import { angleAtT, ellipsePoint, isDegenerateRadii } from './arc.internal';

/**
 * center form arc의 중점(t=0.5) 좌표를 out에 기록하고 out을 반환한다.
 *
 * @param out 중점을 기록할 점 객체
 * @param centerArc center form arc input
 * @returns out
 */
export function arcMiddleInto<Out extends PointWritable>(out: Out, centerArc: CenterArc): Out {
  const { cx, cy, rx, ry, xRotation, startAngle, endAngle } = centerArc;

  if (isDegenerateRadii(rx, ry)) {
    out.x = cx;
    out.y = cy;
    return out;
  }

  const theta = angleAtT(startAngle, endAngle, 0.5);
  const pt: [number, number] = [0, 0];
  ellipsePoint(cx, cy, rx, ry, xRotation, theta, pt);
  out.x = pt[0];
  out.y = pt[1];
  return out;
}
