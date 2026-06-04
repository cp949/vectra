import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { RectLike } from '../types';

/**
 * 두 rect가 교차하거나 접하면 true를 반환한다.
 *
 * empty rect (width ≤ 0 또는 height ≤ 0): false.
 * closed boundary 포함 (접점도 true).
 *
 * @param a 교차를 검사할 첫 번째 rect
 * @param b 교차를 검사할 두 번째 rect
 */
export function intersectsRectRect(a: RectLike, b: RectLike): boolean {
  const ax = readRectX(a);
  const ay = readRectY(a);
  const aw = readRectWidth(a);
  const ah = readRectHeight(a);
  const bx = readRectX(b);
  const by = readRectY(b);
  const bw = readRectWidth(b);
  const bh = readRectHeight(b);
  if (aw <= 0 || ah <= 0) return false;
  if (bw <= 0 || bh <= 0) return false;

  return ax <= bx + bw && bx <= ax + aw && ay <= by + bh && by <= ay + ah;
}
