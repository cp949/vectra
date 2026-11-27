import type { Point } from '../types/flat-shapes.internal';

/**
 * input 벡터의 Manhattan 길이(|x| + |y|)를 반환한다.
 *
 * @param input 길이를 측정할 벡터
 */
export function manhattanLength(input: Point): number {
  return Math.abs(input.x) + Math.abs(input.y);
}
