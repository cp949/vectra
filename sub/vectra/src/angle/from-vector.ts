import { readX, readY } from '../internal/xy';
import { assertFiniteNumbers } from '../math/range.internal';
import type { XYInput } from '../types';

/**
 * 벡터의 방향각을 radian으로 반환한다. 범위는 [-π, π]이다.
 *
 * zero vector는 atan2(0, 0) = 0을 반환한다.
 * vec.angle과 mental model이 다른 angle domain equivalent이다.
 * non-finite 성분(Infinity, NaN)은 RangeError를 던진다.
 *
 * @param input 방향각을 측정할 벡터
 */
export function fromVector(input: XYInput): number {
  const x = readX(input);
  const y = readY(input);
  assertFiniteNumbers([x, y]);
  return Math.atan2(y, x);
}
