import { assertFiniteNumbers, assertNonNegativeFiniteNumber } from '../math/range.internal';
import { angleDelta } from './angle-delta';

/**
 * 두 angle이 epsilon 이내로 근접하면 true를 반환한다.
 *
 * `|angleDelta(a, b)| <= epsilon`으로 판정한다. wrap 기준으로 비교하므로
 * `nearAngle(Math.PI, -Math.PI)`는 `true`이다.
 *
 * `epsilon` 기본값은 `0`. 음수 epsilon은 RangeError를 던진다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param a 첫 번째 angle (radian)
 * @param b 두 번째 angle (radian)
 * @param epsilon 허용할 절대 angular tolerance (기본값: 0)
 */
export function nearAngle(a: number, b: number, epsilon = 0): boolean {
  assertFiniteNumbers([a, b]);
  assertNonNegativeFiniteNumber(epsilon);

  return Math.abs(angleDelta(a, b)) <= epsilon;
}
