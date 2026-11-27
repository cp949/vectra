import type { Point } from '../types/flat-shapes.internal';

/**
 * input의 Chebyshev 길이(L∞ norm)를 반환한다.
 *
 * `Math.max(|x|, |y|)`와 같다.
 *
 * @param input Chebyshev 길이를 구할 입력 벡터
 */
export function chebyshevLength(input: Point): number {
  return Math.max(Math.abs(input.x), Math.abs(input.y));
}
