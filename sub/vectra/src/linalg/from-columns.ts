import type { VecLike } from './types';

/**
 * column vector 목록을 row-major matrix로 변환한 새 `number[][]`로 반환한다.
 *
 * `columns`가 빈 배열이면 `[]`을 반환한다.
 * 모든 column은 array여야 하고 같은 길이여야 한다. 길이가 다르면 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * column 길이가 0이고 column이 둘 이상이면 one-sided zero shape `[0, columns.length]`가 되므로 `RangeError`.
 * 결과 shape는 `[columnLength, columns.length]`다.
 *
 * @param columns column vector 목록. 모든 column이 같은 길이여야 한다.
 */
export function fromColumns(columns: readonly VecLike[]): number[][] {
  const columnCount = columns.length;
  if (columnCount === 0) {
    return [];
  }
  const firstColumn = columns[0];
  if (!Array.isArray(firstColumn)) {
    throw new RangeError(`columns[0] must be an array`);
  }
  const rowCount = firstColumn.length;
  for (let k = 1; k < columnCount; k++) {
    const column = columns[k];
    if (!Array.isArray(column)) {
      throw new RangeError(`columns[${k}] must be an array`);
    }
    if (column.length !== rowCount) {
      throw new RangeError(
        `columns is not rectangular: columns[${k}] has length ${column.length}, expected ${rowCount}`
      );
    }
  }
  if (rowCount === 0) {
    throw new RangeError(`columns one-sided zero shape [0, ${columnCount}] is not supported`);
  }
  for (let k = 0; k < columnCount; k++) {
    const column = columns[k];
    for (let i = 0; i < rowCount; i++) {
      const value = column[i];
      if (!Number.isFinite(value)) {
        throw new RangeError(`columns[${k}][${i}] must be a finite number, got ${String(value)}`);
      }
    }
  }
  const out: number[][] = new Array(rowCount);
  for (let r = 0; r < rowCount; r++) {
    const row = new Array(columnCount);
    for (let k = 0; k < columnCount; k++) {
      row[k] = columns[k][r];
    }
    out[r] = row;
  }
  return out;
}
