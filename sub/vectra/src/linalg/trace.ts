import type { MatLike } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * square matrix의 trace `Σ matrix[i][i]`을 반환한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * square matrix만 허용한다. `rows !== columns`이면 `RangeError`.
 * 빈 matrix `[]`(`shape = [0, 0]`)는 `0`을 반환한다.
 * 누적 합계가 `Infinity`로 overflow되면 `RangeError`를 던진다(개별 entry가 finite여도 합산은 overflow될 수 있다).
 *
 * @param matrix trace를 계산할 square matrix
 */
export function trace(matrix: MatLike): number {
  const [rows, columns] = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, [rows, columns], 'matrix');
  if (rows !== columns) {
    throw new RangeError(`trace requires a square matrix, got shape [${rows}, ${columns}]`);
  }
  let total = 0;
  for (let i = 0; i < rows; i++) {
    total += matrix[i][i];
    if (!Number.isFinite(total)) {
      throw new RangeError(`trace overflow at index ${i}`);
    }
  }
  return total;
}
