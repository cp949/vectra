import type { Point } from '../types/flat-shapes.internal';

/**
 * input의 x와 y 성분의 합을 반환한다.
 *
 * @param input 성분 합을 구할 입력 벡터
 */
export function componentSum(input: Point): number {
  return input.x + input.y;
}
