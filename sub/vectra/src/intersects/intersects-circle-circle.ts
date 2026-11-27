import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY } from '../internal/xy';
import type { CircleLike } from '../types';

/**
 * 두 circle이 교차하거나 접하면 true를 반환한다.
 *
 * radius ≤ 0인 circle: false.
 * closed boundary 포함 (접점도 true).
 *
 * @param a 첫 번째 circle
 * @param b 두 번째 circle
 */
export function intersectsCircleCircle(a: CircleLike, b: CircleLike): boolean {
  const ar = readCircleRadius(a);
  const br = readCircleRadius(b);
  if (ar <= 0 || br <= 0) return false;

  const ca = readCircleCenter(a);
  const cb = readCircleCenter(b);
  const dx = readX(cb) - readX(ca);
  const dy = readY(cb) - readY(ca);
  const rSum = ar + br;
  return dx * dx + dy * dy <= rSum * rSum;
}
