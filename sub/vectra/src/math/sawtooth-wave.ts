import { periodicPhase } from './periodic.internal';
import { assertFiniteNumbers } from './range.internal';

/**
 * 주기 1의 sawtooth wave phase를 반환한다.
 *
 * `t`는 finite number여야 한다. 반환 범위는 `[0, 1)`이며 음수 `t`도 양수 phase로
 * 보정한다. `t = n` 정수 boundary는 `0`이다.
 *
 * @param t sample할 scalar 값
 */
export function sawtoothWave(t: number): number {
  assertFiniteNumbers([t]);

  return periodicPhase(t, 1);
}
