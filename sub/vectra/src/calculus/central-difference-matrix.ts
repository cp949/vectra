import { centralDifferenceMatrixInto } from './central-difference-matrix-into';
import { assertNonNegativeSafeInteger } from './validate.internal';

/**
 * unit-grid central difference matrix `D`를 `[binCount, binCount]` 크기의 새 `number[][]`로 반환한다.
 *
 * `binCount`는 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * row `i ∈ (0, n - 1)`은 central 차분 `[-0.5, +0.5]`를 columns `[i - 1, i + 1]`에 기록한다.
 * 첫 row `0`은 boundary fallback으로 forward one-sided 차분 `[-1, +1]`을 columns `[0, 1]`에 기록한다.
 * 마지막 row `n - 1`은 boundary fallback으로 backward one-sided 차분 `[-1, +1]`을 columns `[n - 2, n - 1]`에
 * 기록한다.
 * `binCount === 0`은 `[]`을 반환한다. `binCount === 1`은 `[[0]]`을 반환한다(boundary 표현 불가).
 *
 * @param binCount 행렬 한 변 크기. 비음의 safe integer.
 */
export function centralDifferenceMatrix(binCount: number): number[][] {
  assertNonNegativeSafeInteger(binCount, 'binCount');
  const out: number[][] = new Array(binCount);
  for (let r = 0; r < binCount; r++) {
    out[r] = new Array(binCount);
  }
  return centralDifferenceMatrixInto(out, binCount);
}
