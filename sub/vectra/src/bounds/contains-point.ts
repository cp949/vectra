import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, XYInput } from '../types';

/**
 * point가 bounds 안이나 boundary 위에 있으면 true를 반환한다.
 *
 * 포함 판정은 closed boundary 기준이다. inverted bounds는 empty로 보고 항상 false를 반환한다.
 *
 * @param bounds point 포함 여부를 판정할 bounds
 * @param point bounds 안에 포함되는지 확인할 point
 */
export function containsPoint(bounds: BoundsLike, point: XYInput): boolean {
  const minX = readX(readBoundsMin(bounds));
  const minY = readY(readBoundsMin(bounds));
  const maxX = readX(readBoundsMax(bounds));
  const maxY = readY(readBoundsMax(bounds));
  // empty bounds(inverted)는 항상 false
  if (maxX < minX || maxY < minY) return false;
  const px = readX(point);
  const py = readY(point);
  return minX <= px && px <= maxX && minY <= py && py <= maxY;
}
