import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY } from '../internal/xy';
import type { BoundsLike } from '../types';

/**
 * bounds가 other를 완전히 포함하면 true를 반환한다.
 *
 * 포함 판정은 closed boundary 기준이다. empty other는 항상 포함된 것으로 보고,
 * empty bounds는 non-empty other를 포함하지 않는다.
 *
 * @param bounds 포함 여부를 판정할 기준 bounds
 * @param other bounds 안에 포함되는지 확인할 대상 bounds
 */
export function containsBounds(bounds: BoundsLike, other: BoundsLike): boolean {
  const bMinX = readX(readBoundsMin(bounds));
  const bMinY = readY(readBoundsMin(bounds));
  const bMaxX = readX(readBoundsMax(bounds));
  const bMaxY = readY(readBoundsMax(bounds));
  const boundsEmpty = bMaxX < bMinX || bMaxY < bMinY;

  const oMinX = readX(readBoundsMin(other));
  const oMinY = readY(readBoundsMin(other));
  const oMaxX = readX(readBoundsMax(other));
  const oMaxY = readY(readBoundsMax(other));
  const otherEmpty = oMaxX < oMinX || oMaxY < oMinY;

  if (otherEmpty) return true;
  if (boundsEmpty) return false;
  return bMinX <= oMinX && oMaxX <= bMaxX && bMinY <= oMinY && oMaxY <= bMaxY;
}
