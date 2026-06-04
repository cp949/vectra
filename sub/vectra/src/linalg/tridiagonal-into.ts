import { assertMatrixOutCapacity } from './matrix-out-capacity.internal';
import type { MatWritable, VecLike } from './types';
import { assertFiniteVector } from './validate.internal';

/**
 * 세 vector를 main/sub/super diagonal로 갖는 tridiagonal square matrix를 `out`에 기록한다.
 *
 * `diagonalEntries`, `leftEntries`, `rightEntries`의 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `n = diagonalEntries.length`라 할 때 `leftEntries.length === n - 1`, `rightEntries.length === n - 1`이어야 한다.
 * `n === 0`이면 left/right length는 `0`이어야 한다. `n === 1`도 마찬가지로 `0`. 위반 시 `RangeError`.
 * `out`은 최소 `n`개의 row를 가져야 하며 각 row(`r < n`)는 `n` 이상의 capacity를 가진 array여야 한다. 부족하면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(모든 validation 성공 후에만 mutate).
 * 성공 시 `out[i][i] = diagonalEntries[i]`, `out[i][i - 1] = leftEntries[i - 1]`(`i >= 1`),
 * `out[i][i + 1] = rightEntries[i]`(`i < n - 1`), 그 외 entry는 `0`을 기록하고 `out.length`는 `n`으로,
 * 각 row length는 `n`으로 truncate된다. `n === 0`은 `out.length = 0`만 설정한다.
 *
 * @param out matrix를 기록할 writable storage. `[n, n]`에 맞는 capacity가 준비되어 있어야 한다.
 * @param diagonalEntries main diagonal 값.
 * @param leftEntries sub-diagonal 값. `out[i][i - 1] = leftEntries[i - 1]` (`i ∈ [1, n)`).
 * @param rightEntries super-diagonal 값. `out[i][i + 1] = rightEntries[i]` (`i ∈ [0, n - 1)`).
 */
export function tridiagonalInto<Out extends MatWritable>(
  out: Out,
  diagonalEntries: VecLike,
  leftEntries: VecLike,
  rightEntries: VecLike
): Out {
  assertFiniteVector(diagonalEntries, 'diagonalEntries');
  assertFiniteVector(leftEntries, 'leftEntries');
  assertFiniteVector(rightEntries, 'rightEntries');
  const n = diagonalEntries.length;
  const expected = n === 0 ? 0 : n - 1;
  if (leftEntries.length !== expected) {
    throw new RangeError(`leftEntries.length must be ${expected}, got ${leftEntries.length}`);
  }
  if (rightEntries.length !== expected) {
    throw new RangeError(`rightEntries.length must be ${expected}, got ${rightEntries.length}`);
  }
  assertMatrixOutCapacity(out, n, n, 'out');
  for (let i = 0; i < n; i++) {
    const row = out[i];
    for (let j = 0; j < n; j++) {
      row[j] = 0;
    }
    row.length = n;
  }
  for (let i = 0; i < n; i++) {
    out[i][i] = diagonalEntries[i];
  }
  for (let i = 1; i < n; i++) {
    out[i][i - 1] = leftEntries[i - 1];
  }
  for (let i = 0; i + 1 < n; i++) {
    out[i][i + 1] = rightEntries[i];
  }
  out.length = n;
  return out;
}
