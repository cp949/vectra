import type { BarycentricWritable } from '../types';
import type { Triangle, Point } from '../types/flat-shapes.internal';
import { barycentricInto } from './barycentric-into';

/**
 * barycentricInto의 allocating companion.
 * point의 barycentric 좌표를 BarycentricWritable로 반환한다.
 * degenerate triangle이면 undefined를 반환한다.
 *
 * @param triangle 기준 triangle
 * @param point barycentric 좌표를 구할 point
 */
export function barycentric(triangle: Triangle, point: Point): BarycentricWritable | undefined {
  const seed: BarycentricWritable = { x: 0, y: 0, w: 0 };
  const result = barycentricInto(seed, triangle, point);
  return result === false ? undefined : result;
}
