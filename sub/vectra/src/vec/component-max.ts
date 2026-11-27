import type { Point } from '../types/flat-shapes.internal';

/**
 * input의 x, y 성분 중 큰 값을 반환한다.
 *
 * @param input 성분을 비교할 벡터
 */
export function componentMax(input: Point): number {
  return Math.max(input.x, input.y);
}
