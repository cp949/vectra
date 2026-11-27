import type { Triangle, PointWritable } from '../types/flat-shapes.internal';
import { pointAtIndexInto } from './point-at-index-into';

/**
 * pointAtIndexInto의 allocating companion.
 * index번째 vertex를 점 객체로 반환한다. invalid index는 undefined.
 */
export function pointAtIndex(triangle: Triangle, index: number): PointWritable | undefined {
  const seed: PointWritable = { x: 0, y: 0 };
  if (!pointAtIndexInto(seed, triangle, index)) return undefined;
  return seed;
}
