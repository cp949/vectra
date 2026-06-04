import { assertFiniteNumbers } from './range.internal';

/**
 * value의 부호를 반환한다.
 *
 * Math.sign의 래퍼. 모든 인자는 finite number여야 한다.
 *
 * @param value 부호를 구할 scalar 값
 */
export function sign(value: number): number {
  assertFiniteNumbers([value]);

  return Math.sign(value);
}
