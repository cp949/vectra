import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY } from '../internal/xy';
import type { BoundsLike } from '../types';

/**
 * bounds가 inverted empty bounds이면 true를 반환한다.
 *
 * max.x < min.x 또는 max.y < min.y인 경우만 empty이다. width나 height가 0인 line/point bounds는
 * empty가 아니다.
 *
 * @param bounds empty 여부를 확인할 bounds
 */
export function isEmpty(bounds: BoundsLike): boolean {
  return (
    readX(readBoundsMax(bounds)) < readX(readBoundsMin(bounds)) ||
    readY(readBoundsMax(bounds)) < readY(readBoundsMin(bounds))
  );
}
