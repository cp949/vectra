import type { BoundsLike, RectWritable } from '../types';
import { createRect } from './create-rect';
import { fromBoundsInto } from './from-bounds-into';

/**
 * bounds extent를 새 plain rect로 반환한다.
 *
 * `x=min.x`, `y=min.y`, `width=max.x-min.x`, `height=max.y-min.y`를 기록한다.
 *
 * @param bounds rect로 변환할 bounds
 */
export function fromBounds(bounds: BoundsLike): RectWritable {
  return fromBoundsInto(createRect(), bounds);
}
