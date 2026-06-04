import { diagonalInto } from './diagonal-into';
import type { MatLike } from './types';

/**
 * matrix의 main diagonal `matrix[i][i]`(`i < min(rows, columns)`)을 복사해 새 `number[]`로 반환한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 빈 matrix `[]`는 빈 배열 `[]`을 반환한다.
 *
 * @param matrix diagonal을 읽을 matrix. square가 아니어도 된다.
 */
export function diagonal(matrix: MatLike): number[] {
  const rows = matrix.length;
  const firstRow = matrix[0];
  const columns = Array.isArray(firstRow) ? firstRow.length : 0;
  const diagLen = rows < columns ? rows : columns;
  const out: number[] = new Array(diagLen);
  return diagonalInto(out, matrix);
}
