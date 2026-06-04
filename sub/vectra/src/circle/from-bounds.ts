import type { BoundsLike, CircleWritable } from '../types';
import { createCircle } from './create-circle';
import { fromBoundsInto } from './from-bounds-into';

/**
 * bounds에 내접하는 circle을 새 plain object로 반환한다.
 *
 * radius는 min(width, height) / 2이다. empty bounds는 radius 0을 기록하고
 * center에 min corner를 그대로 전파한다.
 *
 * @param bounds 내접 circle을 계산할 bounds
 */
export function fromBounds(bounds: BoundsLike): CircleWritable {
  return fromBoundsInto(createCircle(), bounds);
}
