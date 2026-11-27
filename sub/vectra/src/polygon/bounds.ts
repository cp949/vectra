import type { Polygon, BoundsWritable } from '../types/flat-shapes.internal';
import { createZeroBounds } from '../internal/bounds';
import { boundsInto } from './bounds-into';

/**
 * boundsInto의 allocating companion.
 *
 * finite/non-finite 입력과 결과 처리 정책은 `boundsInto`와 동일하다.
 * degenerate/empty 입력 처리 정책은 `boundsInto`와 동일하다.
 */
export function bounds(polygon: Polygon): BoundsWritable {
  const seed = createZeroBounds();
  return boundsInto(seed, polygon);
}
