import { assertFiniteNumbers } from './range.internal';

/**
 * value의 소수 부분을 반환한다.
 *
 * `value - Math.trunc(value)`로 계산한다. 모든 인자는 finite number여야 한다.
 *
 * @param value 소수 부분을 구할 scalar 값
 */
export function fract(value: number): number {
  assertFiniteNumbers([value]);

  return value - Math.trunc(value);
}
