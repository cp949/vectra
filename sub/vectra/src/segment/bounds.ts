import { createBounds } from '../bounds/create-bounds';
import type { BoundsWritable, SegmentLike } from '../types';
import { boundsInto } from './bounds-into';

/**
 * boundsInto의 allocating companion.
 * segment 양 endpoint의 axis-aligned bounding box를 새 BoundsWritable로 반환한다.
 *
 * non-finite endpoint는 IEEE 754 전파 규칙을 따른다.
 * zero-length segment는 점으로 수렴한 bounds(min === max)를 반환한다(inverted 아님).
 *
 * @param line 대상 segment
 */
export function bounds(line: SegmentLike): BoundsWritable {
  return boundsInto(createBounds(), line);
}
