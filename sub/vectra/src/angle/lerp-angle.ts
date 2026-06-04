import { assertFiniteNumbers } from '../math/range.internal';

/**
 * 두 angle 사이를 단순 선형 보간한다.
 *
 * `from + (to - from) * t` 계산이다. wrap 없음. `t`를 clamp하지 않으며 extrapolation을 허용한다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * shortest path 보간이 필요하면 `shortestLerpAngle`을 사용한다.
 *
 * @param from 시작 angle (radian), t === 0일 때의 값
 * @param to 끝 angle (radian), t === 1일 때의 값
 * @param t clamp하지 않는 보간 비율
 */
export function lerpAngle(from: number, to: number, t: number): number {
  assertFiniteNumbers([from, to, t]);

  return from + (to - from) * t;
}
