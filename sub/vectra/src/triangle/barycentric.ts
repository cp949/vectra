import type { TriangleLike, XYInput } from '../types';
import { type BarycentricWritable, barycentricInto } from './barycentric-into';

/**
 * barycentricInto의 allocating companion.
 * point의 barycentric 좌표를 BarycentricWritable로 반환한다.
 * degenerate triangle이면 undefined를 반환한다.
 *
 * @param triangle 기준 triangle
 * @param point barycentric 좌표를 구할 point
 */
export function barycentric(triangle: TriangleLike, point: XYInput): BarycentricWritable | undefined {
  const seed: BarycentricWritable = { x: 0, y: 0, w: 0 };
  const result = barycentricInto(seed, triangle, point);
  return result === false ? undefined : result;
}
