import { assertEasingFunction, assertFiniteT } from './easing.internal';

/**
 * fn을 거울 반전하여 `1 - fn(1 - t)` 값을 반환한다.
 *
 * ease-in fn을 ease-out으로 뒤집는 대표 변환이다.
 * fn 결과 값의 유한성은 검증하지 않는다.
 *
 * @param fn - ease scalar function. function이 아니면 RangeError.
 * @param t - 진행률. finite가 아니면 RangeError.
 */
export function withMirror(fn: (t: number) => number, t: number): number {
  assertEasingFunction(fn);
  assertFiniteT(t);
  return 1 - fn(1 - t);
}
