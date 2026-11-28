import type { Circle } from '../types/flat-shapes.internal';

/**
 * 두 circle이 교차하거나 접하면 true를 반환한다.
 *
 * radius ≤ 0인 circle: false.
 * closed boundary 포함 (접점도 true).
 *
 * @param a 첫 번째 circle
 * @param b 두 번째 circle
 */
export function intersectsCircleCircle(a: Circle, b: Circle): boolean {
  const ar = a.r;
  const br = b.r;
  if (ar <= 0 || br <= 0) return false;

  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  const rSum = ar + br;
  return dx * dx + dy * dy <= rSum * rSum;
}
