import type { Rect } from '../types/flat-shapes.internal';

/**
 * rect의 left 좌표를 반환한다.
 *
 * @param rect left 좌표를 읽을 rect
 */
export function left(rect: Rect): number {
  return rect.x;
}
