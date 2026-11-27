import type { Point } from '../types/flat-shapes.internal';

/**
 * input 벡터의 Euclidean 길이 제곱을 반환한다.
 *
 * @param input 길이를 측정할 벡터
 */
export function lengthSq(input: Point): number {
  const { x, y } = input;
  return x * x + y * y;
}
