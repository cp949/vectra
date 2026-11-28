import type { Bounds, Circle } from '../types/flat-shapes.internal';

/**
 * circle과 bounds가 교차하거나 접하면 true를 반환한다.
 *
 * bounds 내부에서 circle center에 가장 가까운 점과의 거리로 판정한다.
 * r ≤ 0인 circle: false.
 * inverted bounds (min > max): false.
 * closed boundary 포함 (접점도 true).
 *
 * @param circle 교차를 판정할 circle
 * @param bounds 교차를 판정할 bounds
 */
export function intersectsCircleBounds(circle: Circle, bounds: Bounds): boolean {
  const r = circle.r;
  if (r <= 0) return false;

  const minX = bounds.minX;
  const minY = bounds.minY;
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;
  if (maxX < minX || maxY < minY) return false;

  const cx = circle.cx;
  const cy = circle.cy;
  const nearX = Math.max(minX, Math.min(cx, maxX));
  const nearY = Math.max(minY, Math.min(cy, maxY));
  const dx = cx - nearX;
  const dy = cy - nearY;
  return dx * dx + dy * dy <= r * r;
}
