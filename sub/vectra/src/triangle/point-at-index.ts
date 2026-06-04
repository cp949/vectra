import type { TriangleLike, XYObjectWritable } from '../types';
import { pointAtIndexInto } from './point-at-index-into';

/**
 * pointAtIndexInto의 allocating companion.
 * index번째 vertex를 XYObjectWritable로 반환한다. invalid index는 undefined.
 */
export function pointAtIndex(triangle: TriangleLike, index: number): XYObjectWritable | undefined {
  const seed: XYObjectWritable = { x: 0, y: 0 };
  if (!pointAtIndexInto(seed, triangle, index)) return undefined;
  return seed;
}
