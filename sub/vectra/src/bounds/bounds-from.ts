import type { Bounds, BoundsWritable } from '../types/flat-shapes.internal';
import { copyInto } from './copy-into';
import { createBounds } from './create-bounds';

/**
 * `Bounds` source의 min/max를 새 plain object로 복사해 반환한다.
 *
 * 뒤집힌 경계도 정규화하지 않는다.
 *
 * @param bounds 복사할 source bounds
 */
export function boundsFrom(bounds: Bounds): BoundsWritable {
  return copyInto(createBounds(), bounds);
}
