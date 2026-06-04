import { readRectHeight, readRectWidth } from '../internal/rect';
import type { RectLike } from '../types';

/**
 * rect의 면적을 반환한다.
 *
 * empty rect(width <= 0 또는 height <= 0)는 0을 반환한다.
 *
 * @param rect 면적을 측정할 rect
 */
export function area(rect: RectLike): number {
  const width = readRectWidth(rect);
  const height = readRectHeight(rect);
  if (width <= 0 || height <= 0) {
    return 0;
  }
  return width * height;
}
