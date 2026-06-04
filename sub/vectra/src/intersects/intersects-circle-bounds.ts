import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, CircleLike } from '../types';

/**
 * circle과 bounds가 교차하거나 접하면 true를 반환한다.
 *
 * bounds 내부에서 circle center에 가장 가까운 점과의 거리로 판정한다.
 * radius ≤ 0인 circle: false.
 * inverted bounds (min > max): false.
 * closed boundary 포함 (접점도 true).
 *
 * @param circle 교차를 판정할 circle
 * @param bounds 교차를 판정할 bounds
 */
export function intersectsCircleBounds(circle: CircleLike, bounds: BoundsLike): boolean {
  const r = readCircleRadius(circle);
  if (r <= 0) return false;

  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const minX = readX(min);
  const minY = readY(min);
  const maxX = readX(max);
  const maxY = readY(max);
  if (maxX < minX || maxY < minY) return false;

  const cx = readX(readCircleCenter(circle));
  const cy = readY(readCircleCenter(circle));
  const nearX = Math.max(minX, Math.min(cx, maxX));
  const nearY = Math.max(minY, Math.min(cy, maxY));
  const dx = cx - nearX;
  const dy = cy - nearY;
  return dx * dx + dy * dy <= r * r;
}
