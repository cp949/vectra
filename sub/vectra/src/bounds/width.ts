import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX } from '../internal/xy';
import type { BoundsLike } from '../types';

/**
 * bounds의 raw width를 반환한다.
 *
 * empty/inverted bounds에서도 max.x - min.x를 그대로 반환하므로 음수가 될 수 있다.
 *
 * @param bounds width를 계산할 bounds
 */
export function width(bounds: BoundsLike): number {
  return readX(readBoundsMax(bounds)) - readX(readBoundsMin(bounds));
}
