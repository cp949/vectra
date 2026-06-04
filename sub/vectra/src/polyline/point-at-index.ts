import type { PolylineLike, XYObjectWritable } from '../types';
import { pointAtIndexInto } from './point-at-index-into';

/**
 * pointAtIndexInto의 allocating companion. invalid index에서는 undefined를 반환한다.
 *
 * degenerate/empty 입력 처리 정책은 `pointAtIndexInto`와 동일하다.
 */
export function pointAtIndex(polyline: PolylineLike, index: number): XYObjectWritable | undefined {
  const seed: XYObjectWritable = { x: 0, y: 0 };
  if (!pointAtIndexInto(seed, polyline, index)) return undefined;
  return seed;
}
