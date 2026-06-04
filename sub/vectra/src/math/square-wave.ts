import { periodicPhase } from './periodic.internal';
import { assertFiniteNumbers } from './range.internal';

/**
 * 주기 1의 square wave 값을 반환한다.
 *
 * `t`는 finite number여야 한다. `t`의 positive fractional phase가 0.5 미만이면 1,
 * 0.5 이상이면 0이다. `t = n + 0.5` 경계는 0을 반환한다.
 *
 * @param t sample할 scalar 값
 */
export function squareWave(t: number): 0 | 1 {
  assertFiniteNumbers([t]);

  return periodicPhase(t, 1) < 0.5 ? 1 : 0;
}
