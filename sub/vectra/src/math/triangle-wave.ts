import { periodicPingPong } from './periodic.internal';
import { assertFiniteNumbers } from './range.internal';

/**
 * 주기 1의 triangle wave 값을 반환한다.
 *
 * `t`는 finite number여야 한다. 반환 범위는 `[0, 1]`이며 음수 `t`도 양수 phase로
 * 보정한다. `t = n`은 0을, `t = n + 0.5`는 1을 반환한다.
 *
 * @param t sample할 scalar 값
 */
export function triangleWave(t: number): number {
  assertFiniteNumbers([t]);

  return periodicPingPong(t, 0.5) * 2;
}
