import { assertEasingFunction, assertFiniteT } from './easing.internal';

/**
 * fn의 입력 방향을 반전하여 `fn(1 - t)` 값을 반환한다.
 *
 * fn 결과 값의 유한성은 검증하지 않는다.
 *
 * @param fn - ease scalar function. function이 아니면 RangeError.
 * @param t - 진행률. finite가 아니면 RangeError.
 */
export function withReverse(fn: (t: number) => number, t: number): number {
  assertEasingFunction(fn);
  assertFiniteT(t);
  return fn(1 - t);
}
