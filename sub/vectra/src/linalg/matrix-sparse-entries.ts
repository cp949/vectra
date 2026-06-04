import { matrixSparseEntriesInto } from './matrix-sparse-entries-into';
import type { MatLike, SparseMatrixEntry, SparseOptions } from './types';

/**
 * matrix의 `Math.abs(value) > epsilon`인 entry만 새 `SparseMatrixEntry[]`로 반환한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 빈 matrix `[]`는 shape `[0, 0]`로 취급한다. `[[]]`처럼 one-sided zero shape는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 비음의 finite number여야 한다. 위반 시 `RangeError`.
 * entry는 row-major 순서로 반환된다.
 *
 * @param matrix sparse 표현으로 추출할 matrix
 * @param options sparse 변환 옵션. `epsilon` 미지정 시 exact zero(`0`).
 */
export function matrixSparseEntries(matrix: MatLike, options?: SparseOptions): SparseMatrixEntry[] {
  return matrixSparseEntriesInto([], matrix, options);
}
