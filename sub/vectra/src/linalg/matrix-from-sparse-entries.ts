import { matrixFromSparseEntriesInto } from './matrix-from-sparse-entries-into';
import type { MatrixShape, SparseMatrixEntry } from './types';
import { assertMatrixShape } from './validate.internal';

/**
 * `entries`로부터 `shape`에 맞는 dense matrix를 새 `number[][]`로 반환한다.
 *
 * `shape`는 비음의 safe integer 쌍이며 one-sided zero shape이 아니어야 한다. 위반 시 `RangeError`.
 * 각 entry의 `row`/`column`은 `Number.isInteger`이고 shape 범위 안이어야 한다. 위반 시 `RangeError`.
 * 각 entry의 `value`는 finite number여야 한다. 위반 시 `RangeError`.
 * 같은 `(row, column)` 좌표가 두 번 등장하면 `RangeError`(자동 합산하지 않는다).
 *
 * @param shape 재구성할 matrix의 `[rows, columns]`. 비음의 safe integer 쌍.
 * @param entries sparse matrix entry 목록. 같은 `(row, column)`이 두 번 등장하면 `RangeError`.
 */
export function matrixFromSparseEntries(shape: MatrixShape, entries: readonly SparseMatrixEntry[]): number[][] {
  assertMatrixShape(shape, 'shape');
  const [rows, columns] = shape;
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    out[r] = new Array(columns);
  }
  return matrixFromSparseEntriesInto(out, shape, entries);
}
