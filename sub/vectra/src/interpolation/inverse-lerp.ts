import { assertFiniteNumbers, assertNonZeroOrderedRange, clampScalar, inverseLerpRaw } from './interpolation.internal';

/**
 * ordered source range [a, b]에서 value가 차지하는 비율을 반환한다.
 *
 * `math.inverseLerp`와 동일한 정책을 공유하는 discovery alias다.
 * `a >= b`이면 RangeError를 던진다. 반환값은 clamp하지 않으므로
 * source range 밖의 value는 0보다 작거나 1보다 클 수 있다.
 * 모든 인자는 finite number여야 한다.
 *
 * @param a source range의 시작값
 * @param b source range의 끝값
 * @param value 비율로 변환할 scalar 값
 */
export function inverseLerp(a: number, b: number, value: number): number {
  assertFiniteNumbers([a, b, value]);
  assertNonZeroOrderedRange(a, b);

  return inverseLerpRaw(a, b, value);
}

/**
 * ordered source range [a, b]에서 value가 차지하는 비율을 `[0, 1]`로 clamp해 반환한다.
 *
 * `clamp(inverseLerp(a, b, value), 0, 1)`과 동일하다.
 * `clampedLerp`와 대칭 관계: `clampedLerp(a, b, inverseLerpClamped(a, b, v)) === clamp(v, a, b)` (a < b 기준).
 * `a >= b`이면 RangeError를 던진다.
 * 모든 인자는 finite number여야 한다.
 *
 * @param a source range의 시작값
 * @param b source range의 끝값
 * @param value 비율로 변환할 scalar 값
 */
export function inverseLerpClamped(a: number, b: number, value: number): number {
  assertFiniteNumbers([a, b, value]);
  assertNonZeroOrderedRange(a, b);

  return clampScalar(inverseLerpRaw(a, b, value), 0, 1);
}
