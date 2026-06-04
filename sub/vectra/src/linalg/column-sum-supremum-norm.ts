import type { MatLike } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * matrix의 column-sum supremum norm `max_c Σ_r |matrix[r][c]|`을 반환한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 한 column의 절대값 합 누적이 `Infinity`로 overflow되면 `RangeError`(개별 entry가 finite여도 합산은 overflow될 수 있다).
 * 빈 matrix `[]`(`shape = [0, 0]`)는 `0`을 반환한다.
 *
 * @param matrix column-sum supremum norm을 계산할 matrix
 */
export function columnSumSupremumNorm(matrix: MatLike): number {
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  const [rows, columns] = shape;
  let max = 0;
  for (let c = 0; c < columns; c++) {
    let sum = 0;
    for (let r = 0; r < rows; r++) {
      sum += Math.abs(matrix[r][c]);
      if (!Number.isFinite(sum)) {
        throw new RangeError(`columnSumSupremumNorm overflow at column ${c}, row ${r}`);
      }
    }
    if (sum > max) {
      max = sum;
    }
  }
  return max;
}
