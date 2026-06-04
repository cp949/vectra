import { assertEasingFunction, assertFiniteT } from './easing.internal';

/**
 * fn(t) 결과를 [0, 1] 범위로 clamp하여 반환한다.
 *
 * fn(t)가 NaN이면 Math.min/Math.max 연산 결과에 따라 NaN을 그대로 반환한다.
 * fn 결과 값의 유한성은 별도로 검증하지 않는다.
 *
 * @param fn - ease scalar function. function이 아니면 RangeError.
 * @param t - 진행률. finite가 아니면 RangeError.
 */
export function withClamp01(fn: (t: number) => number, t: number): number {
  assertEasingFunction(fn);
  assertFiniteT(t);
  return Math.min(1, Math.max(0, fn(t)));
}
