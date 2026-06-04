import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * input 벡터의 Euclidean 길이를 반환한다.
 *
 * @param input 길이를 측정할 벡터
 */
export function length(input: XYInput): number {
  return Math.hypot(readX(input), readY(input));
}
