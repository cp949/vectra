import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, RectLike } from '../types';

/**
 * rect와 bounds가 교차하거나 접하면 true를 반환한다.
 *
 * empty rect (width ≤ 0 또는 height ≤ 0): false.
 * inverted bounds (maxX < minX 또는 maxY < minY): false.
 * closed boundary 포함 (접점도 true).
 *
 * @param rect 교차를 검사할 rect
 * @param bounds 교차를 검사할 bounds
 */
export function intersectsRectBounds(rect: RectLike, bounds: BoundsLike): boolean {
  const rx = readRectX(rect);
  const ry = readRectY(rect);
  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  if (rw <= 0 || rh <= 0) return false;

  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const minX = readX(min);
  const minY = readY(min);
  const maxX = readX(max);
  const maxY = readY(max);
  if (maxX < minX || maxY < minY) return false;

  return rx <= maxX && minX <= rx + rw && ry <= maxY && minY <= ry + rh;
}
