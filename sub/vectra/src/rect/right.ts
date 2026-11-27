import type { Rect } from '../types/flat-shapes.internal';

/**
 * rect의 right 좌표를 반환한다.
 *
 * width를 정규화하지 않고 `x + width`를 그대로 계산한다.
 *
 * @param rect right 좌표를 읽을 rect
 */
export function right(rect: Rect): number {
  return rect.x + rect.width;
}
