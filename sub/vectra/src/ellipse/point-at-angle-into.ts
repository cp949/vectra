import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY, writeXY } from '../internal/xy';
import type { EllipseLike, XYWritable } from '../types';

/**
 * angle 위치의 ellipse 표면 point를 out에 기록하고 out을 반환한다.
 *
 * angle은 radian이다. 공식: (cx + cos(angle) * radiusX, cy + sin(angle) * radiusY).
 * radiusX <= 0 또는 radiusY <= 0인 empty ellipse는 center를 기록한다.
 *
 * @param out 표면 point를 기록할 writable output
 * @param ellipse 표면 point를 계산할 ellipse
 * @param angle 표면 위치를 나타내는 radian angle
 */
export function pointAtAngleInto<Out extends XYWritable>(out: Out, ellipse: EllipseLike, angle: number): Out {
  const cx = readX(readEllipseCenter(ellipse));
  const cy = readY(readEllipseCenter(ellipse));
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);

  // empty ellipse이면 center를 기록한다
  if (rx <= 0 || ry <= 0) return writeXY(out, cx, cy);

  return writeXY(out, cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry);
}
