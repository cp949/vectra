import type { Point } from '../types/flat-shapes.internal';

/**
 * input의 x, y 성분 중 작은 값을 반환한다.
 *
 * @param input 성분을 비교할 벡터
 */
export function componentMin(input: Point): number {
  return Math.min(input.x, input.y);
}
