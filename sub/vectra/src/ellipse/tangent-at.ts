import type { EllipseLike, XYObjectWritable } from '../types';
import { tangentAtInto } from './tangent-at-into';

/**
 * angle 위치에서 ellipse의 접선 방향 벡터를 plain object로 반환한다.
 *
 * 공식: (-radiusX * sin(angle), radiusY * cos(angle)). 정규화하지 않는다.
 * radiusX <= 0 또는 radiusY <= 0인 empty ellipse는 zero vector를 반환한다.
 *
 * @param ellipse 접선을 계산할 ellipse
 * @param angle 접선 위치를 나타내는 radian angle
 */
export function tangentAt(ellipse: EllipseLike, angle: number): XYObjectWritable {
  return tangentAtInto({ x: 0, y: 0 }, ellipse, angle);
}
