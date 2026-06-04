import { assertFiniteNumbers, assertPositiveFiniteNumber } from './range.internal';
import { smoothBlendOffset } from './smooth-min-max.internal';

/**
 * a와 b의 polynomial smooth minimum을 반환한다.
 *
 * `min(a, b) - h * h * k * 0.25` (`h = max(k - |a - b|, 0) / k`).
 * `|a - b| >= k`이면 정확히 `min(a, b)`, `a === b`이면 `a - k * 0.25`를 반환한다.
 * `a`, `b`는 finite number, `k`는 finite positive number(> 0)여야 하며 아니면 RangeError.
 * 최종 결과가 non-finite이면 RangeError.
 *
 * @param a 첫 번째 값
 * @param b 두 번째 값
 * @param k smoothing 폭. 클수록 두 값이 더 넓게 섞인다.
 */
export function smoothMin(a: number, b: number, k: number): number {
  assertFiniteNumbers([a, b]);
  assertPositiveFiniteNumber(k);

  const result = Math.min(a, b) - smoothBlendOffset(a, b, k);

  if (!Number.isFinite(result)) {
    throw new RangeError('smoothMin result must be a finite number');
  }

  return result;
}
