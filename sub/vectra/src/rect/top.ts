import { readRectY } from '../internal/rect';
import type { RectLike } from '../types';

/**
 * rect의 top 좌표를 반환한다.
 *
 * @param rect top 좌표를 읽을 rect
 */
export function top(rect: RectLike): number {
  return readRectY(rect);
}
