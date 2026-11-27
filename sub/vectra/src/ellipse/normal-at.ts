import type { Ellipse, PointWritable } from '../types/flat-shapes.internal';
import { normalAtInto } from './normal-at-into';

/**
 * angle 위치에서 ellipse의 법선 방향 벡터를 plain object로 반환한다.
 *
 * 공식: (cos(angle) / rx, sin(angle) / ry). 정규화하지 않는다.
 * rx <= 0 또는 ry <= 0인 empty ellipse는 zero vector를 반환한다.
 *
 * @param ellipse 법선을 계산할 ellipse
 * @param angle 법선 위치를 나타내는 radian angle
 */
export function normalAt(ellipse: Ellipse, angle: number): PointWritable {
  return normalAtInto({ x: 0, y: 0 }, ellipse, angle);
}
