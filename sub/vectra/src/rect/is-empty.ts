import type { Rect } from '../types/flat-shapes.internal';

/**
 * rect가 empty인지 반환한다.
 *
 * width <= 0 또는 height <= 0이면 empty로 본다.
 *
 * @param rect empty 여부를 검사할 rect
 */
export function isEmpty(rect: Rect): boolean {
  return rect.width <= 0 || rect.height <= 0;
}
