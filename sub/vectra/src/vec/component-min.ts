import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * input의 x, y 성분 중 작은 값을 반환한다.
 *
 * @param input 성분을 비교할 벡터
 */
export function componentMin(input: XYInput): number {
  return Math.min(readX(input), readY(input));
}
