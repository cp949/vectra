import { assertFiniteNumbers } from './range.internal';

/**
 * value의 절댓값을 반환한다.
 *
 * Math.abs의 래퍼. 모든 인자는 finite number여야 한다.
 *
 * @param value 절댓값을 구할 scalar 값
 */
export function abs(value: number): number {
  assertFiniteNumbers([value]);

  return Math.abs(value);
}
