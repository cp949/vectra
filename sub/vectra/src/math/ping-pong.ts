import { periodicPingPong } from './periodic.internal';
import { assertFiniteNumbers, assertPositiveFiniteNumber } from './range.internal';

/**
 * t를 closed range [0, length]로 fold한 값을 반환한다.
 *
 * `t`는 finite number여야 하고 `length`는 finite positive number여야 한다.
 * `2 * length`가 finite number가 아니면 RangeError를 던진다. boundary에서는
 * `0`, `length`, `0` 순서로 반복한다.
 *
 * @param t fold할 scalar 값
 * @param length 왕복 구간의 한쪽 길이. 양수 finite number여야 한다.
 */
export function pingPong(t: number, length: number): number {
  assertFiniteNumbers([t]);
  assertPositiveFiniteNumber(length);

  if (!Number.isFinite(2 * length)) {
    throw new RangeError('math pingPong period 2 * length must be a finite number');
  }

  return periodicPingPong(t, length);
}
