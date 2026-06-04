import { periodicPhase } from './periodic.internal';
import { assertFiniteNumbers, assertPositiveFiniteNumber } from './range.internal';

/**
 * t를 half-open range [0, length)로 wrap한 phase를 반환한다.
 *
 * `t`는 finite number여야 하고 `length`는 finite positive number여야 한다.
 * positive modulo 정책을 사용하므로 음수 `t`도 양수 phase로 보정한다. 결과의 -0은
 * 0으로 정규화한다.
 *
 * @param t wrap할 scalar 값
 * @param length 주기 길이. 양수 finite number여야 한다.
 */
export function cycle(t: number, length: number): number {
  assertFiniteNumbers([t]);
  assertPositiveFiniteNumber(length);

  return periodicPhase(t, length);
}
