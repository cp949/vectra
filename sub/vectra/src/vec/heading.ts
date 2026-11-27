import type { Point } from '../types/flat-shapes.internal';

/**
 * point의 각도(radian)를 반환한다.
 *
 * `Math.atan2(y, x)`. range: (-π, π]. zero vector(point.x === 0 && point.y === 0)는
 * 0을 반환한다.
 *
 * @param point 각도를 구할 2D 좌표
 */
export function heading(point: Point): number {
  return Math.atan2(point.y, point.x);
}
