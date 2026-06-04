import type { PolylineLike, XYObjectWritable } from '../types';
import { pointAtLengthInto } from './point-at-length-into';

/**
 * pointAtLengthInto의 allocating companion. empty polyline에서는 undefined를 반환한다.
 *
 * clamp/정규화/fallback 정책은 `pointAtLengthInto`와 동일하다.
 */
export function pointAtLength(polyline: PolylineLike, length: number): XYObjectWritable | undefined {
  const seed: XYObjectWritable = { x: 0, y: 0 };
  if (!pointAtLengthInto(seed, polyline, length)) return undefined;
  return seed;
}
