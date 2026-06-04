import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * input 벡터의 Manhattan 길이(|x| + |y|)를 반환한다.
 *
 * @param input 길이를 측정할 벡터
 */
export function manhattanLength(input: XYInput): number {
  return Math.abs(readX(input)) + Math.abs(readY(input));
}
