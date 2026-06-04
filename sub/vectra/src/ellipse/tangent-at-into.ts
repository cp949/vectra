import { readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { writeXY } from '../internal/xy';
import type { EllipseLike, XYWritable } from '../types';

/**
 * angle 위치에서 ellipse의 접선 방향 벡터를 out에 기록하고 out을 반환한다.
 *
 * 공식: (-radiusX * sin(angle), radiusY * cos(angle)). 정규화하지 않는다.
 * radiusX <= 0 또는 radiusY <= 0인 empty ellipse는 zero vector (0, 0)을 기록한다.
 *
 * @param out 접선 방향 벡터를 기록할 writable output
 * @param ellipse 접선을 계산할 ellipse
 * @param angle 접선 위치를 나타내는 radian angle
 */
export function tangentAtInto<Out extends XYWritable>(out: Out, ellipse: EllipseLike, angle: number): Out {
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);

  // empty ellipse이면 zero vector를 기록한다 (공식 적용 시 division-by-zero 위험)
  if (rx <= 0 || ry <= 0) return writeXY(out, 0, 0);

  return writeXY(out, -rx * Math.sin(angle), ry * Math.cos(angle));
}
