import { fillFiniteDifferenceMatrixInto } from './finite-difference-matrix.internal';
import { assertNonNegativeSafeInteger } from './validate.internal';

/**
 * unit-grid backward difference matrix `D`를 `[binCount, binCount]` 크기로 `out`에 기록한다.
 *
 * `binCount`는 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * row `i ∈ [1, n)`은 두 sample 사이 backward 차분 `[-1, +1]`을 columns `[i - 1, i]`에 기록한다.
 * 첫 row `0`은 boundary fallback으로 forward one-sided 차분 `[-1, +1]`을 columns `[0, 1]`에 기록한다.
 * `binCount === 0`은 `out.length = 0`만 설정한다. `binCount === 1`은 `[[0]]`을 기록한다(boundary 표현 불가).
 * `out`은 최소 `n`개의 row를 가져야 하며 각 row(`r < n`)는 `n` 이상의 capacity를 가진 array여야 한다.
 * 부족하면 `RangeError`. 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다.
 * 성공 시 `out.length`는 `n`으로, 각 row length는 `n`으로 truncate된다.
 *
 * @param out matrix를 기록할 writable storage. `[binCount, binCount]`에 맞는 capacity가 준비되어 있어야 한다.
 * @param binCount 행렬 한 변 크기. 비음의 safe integer.
 */
export function backwardDifferenceMatrixInto<Out extends number[][]>(out: Out, binCount: number): Out {
  assertNonNegativeSafeInteger(binCount, 'binCount');
  fillFiniteDifferenceMatrixInto(out, binCount, (row, i, n) => {
    if (n === 1) {
      return;
    }
    if (i === 0) {
      // boundary fallback: 첫 row는 forward one-sided로 대체한다.
      row[0] = -1;
      row[1] = 1;
      return;
    }
    row[i - 1] = -1;
    row[i] = 1;
  });
  return out;
}
