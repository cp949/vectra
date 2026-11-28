import type { Bounds } from '../types/flat-shapes.internal';

/**
 * 두 bounds가 교차하거나 접하면 true를 반환한다.
 *
 * inverted bounds (min > max): false.
 * closed boundary 포함 (접점도 true).
 *
 * @param a 첫 번째 bounds
 * @param b 두 번째 bounds
 */
export function intersectsBoundsBounds(a: Bounds, b: Bounds): boolean {
  const aMinX = a.minX;
  const aMinY = a.minY;
  const aMaxX = a.maxX;
  const aMaxY = a.maxY;
  if (aMaxX < aMinX || aMaxY < aMinY) return false;

  const bMinX = b.minX;
  const bMinY = b.minY;
  const bMaxX = b.maxX;
  const bMaxY = b.maxY;
  if (bMaxX < bMinX || bMaxY < bMinY) return false;

  return aMinX <= bMaxX && bMinX <= aMaxX && aMinY <= bMaxY && bMinY <= aMaxY;
}
