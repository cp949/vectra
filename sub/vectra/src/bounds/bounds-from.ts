import type { BoundsLike, BoundsWritable, XYInput } from '../types';
import { copyInto } from './copy-into';
import { createBounds } from './create-bounds';

/**
 * `BoundsLike` source의 min/max를 새 plain object로 복사해 반환한다.
 *
 * @param bounds 복사할 source bounds
 */
export function boundsFrom(bounds: BoundsLike): BoundsWritable;
/**
 * min/max component로 새 plain bounds writable을 만든다.
 */
export function boundsFrom(min: XYInput, max: XYInput): BoundsWritable;
export function boundsFrom(boundsOrMin: BoundsLike | XYInput, max?: XYInput): BoundsWritable {
  if (max === undefined) {
    return copyInto(createBounds(), boundsOrMin as BoundsLike);
  }
  return copyInto(createBounds(), boundsOrMin as XYInput, max);
}
