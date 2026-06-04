import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * input의 x와 y 성분의 합을 반환한다.
 *
 * @param input 성분 합을 구할 입력 벡터
 */
export function componentSum(input: XYInput): number {
  return readX(input) + readY(input);
}
