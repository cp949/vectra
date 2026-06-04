import { createBounds } from '../bounds/create-bounds';
import type { BoundsWritable, TriangleLike } from '../types';
import { boundsInto } from './bounds-into';

/**
 * boundsInto의 allocating companion.
 * triangle의 axis-aligned bounding box를 BoundsWritable로 반환한다.
 *
 * finite/non-finite 입력과 결과 처리 정책은 `boundsInto`와 동일하다.
 * degenerate/empty 입력 처리 정책은 `boundsInto`와 동일하다.
 * clamp/정규화/fallback 정책은 `boundsInto`와 동일하다.
 * tolerance/iteration option 정책은 `boundsInto`와 동일하다.
 */
export function bounds(triangle: TriangleLike): BoundsWritable {
  const seed = createBounds();
  return boundsInto(seed, triangle);
}
