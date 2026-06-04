import { readRectX } from '../internal/rect';
import type { RectLike } from '../types';

/**
 * rect의 left 좌표를 반환한다.
 *
 * @param rect left 좌표를 읽을 rect
 */
export function left(rect: RectLike): number {
  return readRectX(rect);
}
