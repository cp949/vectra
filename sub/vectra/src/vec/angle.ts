import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * 벡터의 방향각을 radian으로 반환한다. 범위는 (-π, π]이다.
 *
 * zero vector는 0을 반환한다.
 *
 * @param input 방향각을 측정할 벡터
 */
export function angle(input: XYInput): number {
  return Math.atan2(readY(input), readX(input));
}
