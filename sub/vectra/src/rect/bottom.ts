import { readRectHeight, readRectY } from '../internal/rect';
import type { RectLike } from '../types';

/**
 * rect의 bottom 좌표를 반환한다.
 *
 * height를 정규화하지 않고 `y + height`를 그대로 계산한다.
 *
 * @param rect bottom 좌표를 읽을 rect
 */
export function bottom(rect: RectLike): number {
  return readRectY(rect) + readRectHeight(rect);
}
