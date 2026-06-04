import { readRectHeight, readRectWidth } from '../internal/rect';
import type { RectLike } from '../types';

/**
 * rect가 empty인지 반환한다.
 *
 * width <= 0 또는 height <= 0이면 empty로 본다.
 *
 * @param rect empty 여부를 검사할 rect
 */
export function isEmpty(rect: RectLike): boolean {
  return readRectWidth(rect) <= 0 || readRectHeight(rect) <= 0;
}
