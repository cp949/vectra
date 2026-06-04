import { assertFiniteNumbers } from './range.internal';

/**
 * value의 정수 부분을 반환한다(0 방향으로 절사).
 *
 * Math.trunc의 래퍼. 모든 인자는 finite number여야 한다.
 *
 * @param value 정수 부분을 구할 scalar 값
 */
export function trunc(value: number): number {
  assertFiniteNumbers([value]);

  return Math.trunc(value);
}
