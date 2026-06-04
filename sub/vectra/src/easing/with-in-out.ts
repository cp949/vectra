import { assertEasingFunction, assertFiniteT } from './easing.internal';

/**
 * ease-in fn을 ease-in-out으로 합성한다.
 *
 * - `t < 0.5` : `fn(2 * t) / 2`
 * - `t >= 0.5` : `1 - fn(2 - 2 * t) / 2`
 *
 * fn은 ease-in shape를 받는 pure scalar function으로 간주한다.
 * fn 결과 값의 유한성은 검증하지 않는다.
 *
 * @param fn - ease-in scalar function. function이 아니면 RangeError.
 * @param t - 진행률. finite가 아니면 RangeError.
 */
export function withInOut(fn: (t: number) => number, t: number): number {
  assertEasingFunction(fn);
  assertFiniteT(t);
  if (t < 0.5) {
    return fn(2 * t) / 2;
  }
  return 1 - fn(2 - 2 * t) / 2;
}
