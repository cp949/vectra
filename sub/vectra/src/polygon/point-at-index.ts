import type { PolygonLike, XYObjectWritable } from '../types';
import { pointAtIndexInto } from './point-at-index-into';

/**
 * pointAtIndexInto의 allocating companion. invalid index에서는 undefined를 반환한다.
 *
 * finite/non-finite 입력과 결과 처리 정책은 `pointAtIndexInto`와 동일하다.
 * degenerate/empty 입력 처리 정책은 `pointAtIndexInto`와 동일하다.
 */
export function pointAtIndex(polygon: PolygonLike, index: number): XYObjectWritable | undefined {
  const seed: XYObjectWritable = { x: 0, y: 0 };
  if (!pointAtIndexInto(seed, polygon, index)) return undefined;
  return seed;
}
