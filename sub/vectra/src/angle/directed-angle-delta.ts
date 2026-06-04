import { assertFiniteNumbers } from '../math/range.internal';

/**
 * 두 angle의 signed delta를 반환한다.
 *
 * `to - from` 그대로 반환한다. wrap 없음. 범위 제한 없음.
 * non-finite 입력은 RangeError를 던진다.
 *
 * `angleDelta`와 달리 circular wrap을 적용하지 않는 raw signed delta이다.
 *
 * @param from 기준 angle (radian)
 * @param to 목표 angle (radian)
 */
export function directedAngleDelta(from: number, to: number): number {
  assertFiniteNumbers([from, to]);

  return to - from;
}
