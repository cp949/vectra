import type { Point } from '../types/flat-shapes.internal';

/**
 * input의 x와 y 성분의 곱을 반환한다.
 *
 * @param input 성분 곱을 구할 입력 벡터
 */
export function componentProduct(input: Point): number {
  return input.x * input.y;
}
