import type { Rect } from '../types/flat-shapes.internal';

/**
 * rect의 top 좌표를 반환한다.
 *
 * @param rect top 좌표를 읽을 rect
 */
export function top(rect: Rect): number {
  return rect.y;
}
