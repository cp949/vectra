import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readY } from '../internal/xy';
import type { BoundsLike } from '../types';

/**
 * bounds의 raw height를 반환한다.
 *
 * empty/inverted bounds에서도 max.y - min.y를 그대로 반환하므로 음수가 될 수 있다.
 *
 * @param bounds height를 계산할 bounds
 */
export function height(bounds: BoundsLike): number {
  return readY(readBoundsMax(bounds)) - readY(readBoundsMin(bounds));
}
