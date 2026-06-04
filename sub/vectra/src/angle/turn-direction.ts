import { assertFiniteNumbers, assertNonNegativeFiniteNumber } from '../math/range.internal';
import { angleDelta } from './angle-delta';

/**
 * from에서 to 방향을 판정한다.
 *
 * `angleDelta(from, to)`가 `epsilon`보다 크면 `1`, `-epsilon`보다 작으면 `-1`, 그 외 `0`.
 * CCW가 양수(`+1`)인 수학적 표준을 따른다.
 *
 * `epsilon` 기본값은 `0` (정확한 부등식 비교). 음수 epsilon은 RangeError를 던진다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param from 기준 angle (radian)
 * @param to 목표 angle (radian)
 * @param epsilon near-equal 판정 tolerance (기본값: 0)
 */
export function turnDirection(from: number, to: number, epsilon = 0): -1 | 0 | 1 {
  assertFiniteNumbers([from, to]);
  assertNonNegativeFiniteNumber(epsilon);

  const delta = angleDelta(from, to);

  if (delta > epsilon) return 1;
  if (delta < -epsilon) return -1;
  return 0;
}
