import { createZeroBounds } from '../internal/bounds';
import type { BoundsWritable, Segment } from '../types/flat-shapes.internal';
import { boundsInto } from './bounds-into';

/**
 * boundsInto의 allocating companion.
 * segment 양 endpoint의 axis-aligned bounding box를 새 BoundsWritable로 반환한다.
 *
 * non-finite endpoint는 IEEE 754 전파 규칙을 따른다.
 * zero-length segment는 점으로 수렴한 경계 상자(minX === maxX, minY === maxY)를 반환한다(inverted 아님).
 *
 * @param line 대상 segment
 */
export function bounds(line: Segment): BoundsWritable {
  return boundsInto(createZeroBounds(), line);
}
