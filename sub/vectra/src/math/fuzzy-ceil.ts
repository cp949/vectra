import { DEFAULT_EPSILON } from '../internal/numeric';
import { assertFiniteNumbers, assertNonNegativeFiniteNumber } from './range.internal';

/**
 * epsilon 이내로 이전 정수에 가까운 값을 보정해 ceil한다.
 *
 * 입력은 finite number여야 한다. `epsilon`은 0 이상이어야 하며, 기본값은 DEFAULT_EPSILON이다.
 * 계산식은 Math.ceil(value - epsilon)이다.
 *
 * @param value ceil할 값
 * @param epsilon 이전 정수에 가까운 값을 보정할 절대 오차
 */
export function fuzzyCeil(value: number, epsilon = DEFAULT_EPSILON): number {
  assertFiniteNumbers([value]);
  assertNonNegativeFiniteNumber(epsilon);

  return Math.ceil(value - epsilon);
}
