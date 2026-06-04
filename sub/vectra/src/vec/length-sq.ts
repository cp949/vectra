import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * input 벡터의 Euclidean 길이 제곱을 반환한다.
 *
 * @param input 길이를 측정할 벡터
 */
export function lengthSq(input: XYInput): number {
  const x = readX(input);
  const y = readY(input);

  return x * x + y * y;
}
