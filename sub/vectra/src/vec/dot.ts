import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * a와 b의 dot product를 반환한다.
 *
 * @param a dot product의 첫 번째 벡터
 * @param b dot product의 두 번째 벡터
 */
export function dot(a: XYInput, b: XYInput): number {
  return readX(a) * readX(b) + readY(a) * readY(b);
}
