import type { MatLike } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * matrix의 Frobenius norm `sqrt(Σ entry²)`을 안정화된 scaling loop로 반환한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 빈 matrix `[]`(`shape = [0, 0]`)는 `0`을 반환한다.
 * 단순 `sum(entry * entry)` 대신 max scaling 방식(`max * sqrt(Σ (entry/max)²)`)을 사용해 overflow/underflow에 강건하다.
 *
 * @param matrix Frobenius norm을 계산할 matrix
 */
export function frobeniusNorm(matrix: MatLike): number {
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  const [rows, columns] = shape;
  let max = 0;
  for (let r = 0; r < rows; r++) {
    const row = matrix[r];
    for (let c = 0; c < columns; c++) {
      const a = Math.abs(row[c]);
      if (a > max) {
        max = a;
      }
    }
  }
  if (max === 0) {
    return 0;
  }
  let sum = 0;
  for (let r = 0; r < rows; r++) {
    const row = matrix[r];
    for (let c = 0; c < columns; c++) {
      const s = row[c] / max;
      sum += s * s;
    }
  }
  return max * Math.sqrt(sum);
}
