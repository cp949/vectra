import type { Rect } from '../types/flat-shapes.internal';

/**
 * rect의 면적을 반환한다.
 *
 * empty rect(width <= 0 또는 height <= 0)는 0을 반환한다.
 *
 * @param rect 면적을 측정할 rect
 */
export function area(rect: Rect): number {
  const width = rect.width;
  const height = rect.height;
  if (width <= 0 || height <= 0) {
    return 0;
  }
  return width * height;
}
