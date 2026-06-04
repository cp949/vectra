import { assertFiniteNumbers } from '../math/range.internal';
import { rawSweepCcw } from './sweep.internal';

/**
 * from에서 to까지 counter-clockwise sweep 크기를 반환한다.
 *
 * `(to - from)`을 `[0, 2π)` 범위로 정규화해 반환한다.
 * `from === to`와 full-turn equivalent는 `0`이다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param from 시작 angle (radian)
 * @param to 끝 angle (radian)
 */
export function counterClockwiseSweep(from: number, to: number): number {
  assertFiniteNumbers([from, to]);

  return rawSweepCcw(from, to);
}
