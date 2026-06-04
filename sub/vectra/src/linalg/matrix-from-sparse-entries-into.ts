import type { MatrixShape, MatWritable, SparseMatrixEntry } from './types';
import { assertFiniteNumber, assertMatrixShape } from './validate.internal';

/**
 * `entries`로부터 `shape`에 맞는 dense matrix를 재구성해 `out`에 기록한다.
 *
 * `shape`는 비음의 safe integer 쌍이며 one-sided zero shape이 아니어야 한다. 위반 시 `RangeError`.
 * 각 entry의 `row`/`column`은 `Number.isInteger`이고 shape 범위 안이어야 한다. 위반 시 `RangeError`.
 * 각 entry의 `value`는 finite number여야 한다. 위반 시 `RangeError`.
 * 같은 `(row, column)` 좌표가 두 번 등장하면 `RangeError`(자동 합산하지 않는다).
 * `out`은 최소 `rows`개의 row를 가져야 하며 각 row(`r < rows`)는 `columns` 이상의 capacity를 가진 array여야 한다. 부족하면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 수정되지 않는다(모든 validation이 성공한 뒤에만 mutate).
 * 성공 시 각 row를 0으로 채운 뒤 entry를 기록하고, `out.length`는 `rows`로, 각 row length는 `columns`로 truncate된다.
 *
 * @param out matrix를 기록할 writable storage. shape에 맞는 row와 column capacity가 준비되어 있어야 한다.
 * @param shape 재구성할 matrix의 `[rows, columns]`. 비음의 safe integer 쌍.
 * @param entries sparse matrix entry 목록. 같은 `(row, column)`이 두 번 등장하면 `RangeError`.
 */
export function matrixFromSparseEntriesInto<Out extends MatWritable>(
  out: Out,
  shape: MatrixShape,
  entries: readonly SparseMatrixEntry[]
): Out {
  assertMatrixShape(shape, 'shape');
  const [rows, columns] = shape;
  const seen = new Set<string>();
  for (let k = 0; k < entries.length; k++) {
    const { row, column, value } = entries[k];
    if (!Number.isInteger(row) || row < 0 || row >= rows) {
      throw new RangeError(`entries[${k}].row must be an integer in [0, ${rows}), got ${String(row)}`);
    }
    if (!Number.isInteger(column) || column < 0 || column >= columns) {
      throw new RangeError(`entries[${k}].column must be an integer in [0, ${columns}), got ${String(column)}`);
    }
    assertFiniteNumber(value, `entries[${k}].value`);
    const key = `${row},${column}`;
    if (seen.has(key)) {
      throw new RangeError(`entries[${k}] (row=${row}, column=${column}) is a duplicate`);
    }
    seen.add(key);
  }
  if (out.length < rows) {
    throw new RangeError(`out row count (${out.length}) is less than shape rows (${rows})`);
  }
  for (let r = 0; r < rows; r++) {
    const row = out[r];
    if (!Array.isArray(row)) {
      throw new RangeError(`out[${r}] must be an array with capacity >= ${columns}`);
    }
    if (row.length < columns) {
      throw new RangeError(`out[${r}] capacity (${row.length}) is less than shape columns (${columns})`);
    }
  }
  for (let r = 0; r < rows; r++) {
    const row = out[r];
    for (let c = 0; c < columns; c++) {
      row[c] = 0;
    }
    row.length = columns;
  }
  for (let k = 0; k < entries.length; k++) {
    const { row, column, value } = entries[k];
    out[row][column] = value;
  }
  out.length = rows;
  return out;
}
