import { assertMatrixOutCapacity } from './matrix-out-capacity.internal';
import type { MatWritable, VecLike } from './types';
import { assertFiniteVector } from './validate.internal';

/**
 * `diagonalEntries`를 main diagonal로 갖는 square matrix를 `out`에 기록한다.
 *
 * 모든 `diagonalEntries[i]`는 finite number여야 한다. 위반 시 `RangeError`.
 * 결과 shape는 `[n, n]` (`n = diagonalEntries.length`).
 * `out`은 최소 `n`개의 row를 가져야 하며 각 row(`r < n`)는 `n` 이상의 capacity를 가진 array여야 한다. 부족하면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(모든 validation 성공 후에만 mutate).
 * 성공 시 `out[i][i] = diagonalEntries[i]`, 그 외 `out[i][j] = 0`을 기록하고 `out.length`는 `n`으로, 각 row length는 `n`으로 truncate된다.
 * `diagonalEntries.length === 0`은 `out.length = 0`만 설정한다.
 *
 * @param out matrix를 기록할 writable storage. `[n, n]`에 맞는 capacity가 준비되어 있어야 한다.
 * @param diagonalEntries main diagonal 값. 모든 entry는 finite number여야 한다.
 */
export function diagonalMatrixInto<Out extends MatWritable>(out: Out, diagonalEntries: VecLike): Out {
  assertFiniteVector(diagonalEntries, 'diagonalEntries');
  const n = diagonalEntries.length;
  assertMatrixOutCapacity(out, n, n, 'out');
  for (let i = 0; i < n; i++) {
    const row = out[i];
    for (let j = 0; j < n; j++) {
      row[j] = 0;
    }
    row[i] = diagonalEntries[i];
    row.length = n;
  }
  out.length = n;
  return out;
}
