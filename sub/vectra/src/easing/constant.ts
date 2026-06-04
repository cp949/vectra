import { assertFiniteT } from './easing.internal';

/**
 * t 값과 무관하게 value를 반환하는 상수 easing 함수다.
 *
 * t와 value는 모두 finite number여야 한다. NaN/±Infinity는 RangeError를 던진다.
 *
 * @param t easing progress (보통 [0, 1])
 * @param value 반환할 상수값. 기본값 0
 */
export function constant(t: number, value = 0): number {
  assertFiniteT(t);

  if (!Number.isFinite(value)) {
    throw new RangeError('easing constant value must be a finite number');
  }

  return value;
}
