import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * input의 Chebyshev 길이(L∞ norm)를 반환한다.
 *
 * `Math.max(|x|, |y|)`와 같다.
 *
 * @param input Chebyshev 길이를 구할 입력 벡터
 */
export function chebyshevLength(input: XYInput): number {
  return Math.max(Math.abs(readX(input)), Math.abs(readY(input)));
}
