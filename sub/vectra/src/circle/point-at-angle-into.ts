import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY, writeXY } from '../internal/xy';
import type { CircleLike, XYWritable } from '../types';

/**
 * angle 위치의 circle 표면 point를 out에 기록하고 out을 반환한다.
 *
 * angle은 radian이다. radius <= 0인 empty circle은 center를 기록한다.
 *
 * @param out 표면 point를 기록할 writable output
 * @param circle 표면 point를 계산할 circle
 * @param angle 표면 위치를 나타내는 radian angle
 */
export function pointAtAngleInto<Out extends XYWritable>(out: Out, circle: CircleLike, angle: number): Out {
  const cx = readX(readCircleCenter(circle));
  const cy = readY(readCircleCenter(circle));
  const r = readCircleRadius(circle);

  if (r <= 0) return writeXY(out, cx, cy);

  return writeXY(out, cx + r * Math.cos(angle), cy + r * Math.sin(angle));
}
