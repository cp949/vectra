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
  if (readCircleRadius(a) <= 0 || readCircleRadius(b) <= 0) return false;

  const ax = readX(readCircleCenter(a));
  const ay = readY(readCircleCenter(a));
  const bx = readX(readCircleCenter(b));
  const by = readY(readCircleCenter(b));
  const dx = bx - ax;
  const dy = by - ay;
  const rSum = readCircleRadius(a) + readCircleRadius(b);
  return dx * dx + dy * dy <= rSum * rSum;
}
