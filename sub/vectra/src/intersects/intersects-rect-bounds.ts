import type { Bounds, Rect } from '../types/flat-shapes.internal';

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
export function intersectsRectBounds(rect: Rect, bounds: Bounds): boolean {
  const rx = rect.x;
  const ry = rect.y;
  const rw = rect.width;
  const rh = rect.height;
  if (rw <= 0 || rh <= 0) return false;

  const minX = bounds.minX;
  const minY = bounds.minY;
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;
  if (maxX < minX || maxY < minY) return false;

  return rx <= maxX && minX <= rx + rw && ry <= maxY && minY <= ry + rh;
}
