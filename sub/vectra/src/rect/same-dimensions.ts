import type { Rect } from '../types/flat-shapes.internal';

/**
 * 두 rect의 width와 height가 같은지 비교하여 boolean을 반환한다.
 *
 * 위치(x, y)는 비교하지 않는다. width/height를 정규화 없이 raw 값으로 비교한다.
 * negative dimension도 raw 값으로 비교한다.
 *
 * @param a 비교할 첫 번째 rect
 * @param b 비교할 두 번째 rect
 */
export function sameDimensions(a: Rect, b: Rect): boolean {
  return a.width === b.width && a.height === b.height;
}
