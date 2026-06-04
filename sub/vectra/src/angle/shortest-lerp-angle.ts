import { assertFiniteNumbers } from '../math/range.internal';
import { angleDelta } from './angle-delta';

/**
 * shortest path를 따르는 circular angle 보간을 수행한다.
 *
 * `from + angleDelta(from, to) * t` 계산이다. `angleDelta`가 `[-π, π)` wrap을 보장하므로
 * 항상 shortest arc를 따른다. `t`를 clamp하지 않으며 extrapolation을 허용한다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * 단순 linear 보간이 필요하면 `lerpAngle`을 사용한다.
 *
 * @param from 시작 angle (radian), t === 0일 때의 값
 * @param to 목표 angle (radian), t === 1일 때의 shortest path 끝
 * @param t clamp하지 않는 보간 비율
 */
export function shortestLerpAngle(from: number, to: number, t: number): number {
  assertFiniteNumbers([from, to, t]);

  return from + angleDelta(from, to) * t;
}
