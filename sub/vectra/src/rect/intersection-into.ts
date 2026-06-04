import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { RectLike, RectWritable } from '../types';

/**
 * 두 rect의 양수-area 교집합을 out에 기록한다.
 *
 * 둘 중 하나라도 empty이거나 edge touch/corner-only 접촉처럼 교집합 area가 0이면
 * false를 반환하고 out을 수정하지 않는다.
 * out과 입력 rect가 같은 object여도 안전하다.
 *
 * @param out 교집합 rect를 기록할 writable output
 * @param a 교집합을 계산할 첫 번째 rect
 * @param b 교집합을 계산할 두 번째 rect
 */
export function intersectionInto(out: RectWritable, a: RectLike, b: RectLike): boolean {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 계산한다
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

  const newX = ax > bx ? ax : bx;
  const newY = ay > by ? ay : by;
  const aRight = ax + aw;
  const bRight = bx + bw;
  const newRight = aRight < bRight ? aRight : bRight;
  const aBottom = ay + ah;
  const bBottom = by + bh;
  const newBottom = aBottom < bBottom ? aBottom : bBottom;

  // area=0인 경우(edge touch, corner-only)는 기록하지 않는다
  if (newRight <= newX || newBottom <= newY) return false;

  out.x = newX;
  out.y = newY;
  out.width = newRight - newX;
  out.height = newBottom - newY;
  return true;
}
