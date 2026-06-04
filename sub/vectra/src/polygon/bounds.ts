import { createBounds } from '../bounds/create-bounds';
import type { BoundsWritable, PolygonLike } from '../types';
import { boundsInto } from './bounds-into';

/**
 * boundsInto의 allocating companion.
 *
 * finite/non-finite 입력과 결과 처리 정책은 `boundsInto`와 동일하다.
 * degenerate/empty 입력 처리 정책은 `boundsInto`와 동일하다.
 */
export function bounds(polygon: PolygonLike): BoundsWritable {
  const seed = createBounds();
  return boundsInto(seed, polygon);
}
