import { scaleMatrixInto } from './scale-matrix-into';
import type { MatLike } from './types';

/**
 * matrix를 scalar로 곱한 결과 `[matrix[r][c] * scalar]`을 새 `number[][]`로 반환한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `scalar`는 finite number여야 한다. 위반 시 `RangeError`.
 * 모든 element 곱이 finite number여야 한다. 위반 시 `RangeError`.
 * 빈 matrix `[]`(`shape = [0, 0]`)는 빈 배열 `[]`을 반환한다.
 *
 * @param matrix scale할 matrix
 * @param scalar 모든 entry에 곱할 finite scalar
 */
export function scaleMatrix(matrix: MatLike, scalar: number): number[][] {
  const rows = matrix.length;
  const firstRow = matrix[0];
  const columns = Array.isArray(firstRow) ? firstRow.length : 0;
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    out[r] = new Array(columns);
  }
  return scaleMatrixInto(out, matrix, scalar);
}
