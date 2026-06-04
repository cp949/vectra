import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY } from '../internal/xy';
import type { BoundsLike } from '../types';

/**
 * 두 bounds가 교차하거나 접하면 true를 반환한다.
 *
 * inverted bounds (min > max): false.
 * closed boundary 포함 (접점도 true).
 *
 * @param a 첫 번째 bounds
 * @param b 두 번째 bounds
 */
export function intersectsBoundsBounds(a: BoundsLike, b: BoundsLike): boolean {
  const aMinX = readX(readBoundsMin(a));
  const aMinY = readY(readBoundsMin(a));
  const aMaxX = readX(readBoundsMax(a));
  const aMaxY = readY(readBoundsMax(a));
  if (aMaxX < aMinX || aMaxY < aMinY) return false;

  const bMinX = readX(readBoundsMin(b));
  const bMinY = readY(readBoundsMin(b));
  const bMaxX = readX(readBoundsMax(b));
  const bMaxY = readY(readBoundsMax(b));
  if (bMaxX < bMinX || bMaxY < bMinY) return false;

  return aMinX <= bMaxX && bMinX <= aMaxX && aMinY <= bMaxY && bMinY <= aMaxY;
}
