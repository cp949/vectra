import { DEFAULT_EPSILON } from '../internal/numeric';
import type { MatLike } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * 두 matrix의 각 entry 차이가 epsilon 이하이면 `true`를 반환한다.
 *
 * 두 matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `epsilon`은 0 이상 finite number여야 한다. NaN, Infinity, 음수이면 `RangeError`.
 * shape가 다르면 `false`를 반환한다.
 * 같은 shape에서는 `Math.abs(a[r][c] - b[r][c]) <= epsilon`이 모든 entry에 성립해야 `true`. 경계값을 포함한다.
 * 빈 matrix `[]`(`shape = [0, 0]`) 두 개는 `true`를 반환한다.
 *
 * @param a 비교할 첫 번째 matrix
 * @param b 비교할 두 번째 matrix
 * @param epsilon 허용할 절대 오차. 기본 `DEFAULT_EPSILON`(1e-9).
 */
export function nearEquals(a: MatLike, b: MatLike, epsilon: number = DEFAULT_EPSILON): boolean {
  if (!Number.isFinite(epsilon) || epsilon < 0) {
    throw new RangeError(`epsilon must be a finite number >= 0, got ${String(epsilon)}`);
  }
  const shapeA = extractMatrixShape(a, 'a');
  const shapeB = extractMatrixShape(b, 'b');
  assertFiniteMatrixEntries(a, shapeA, 'a');
  assertFiniteMatrixEntries(b, shapeB, 'b');
  if (shapeA[0] !== shapeB[0] || shapeA[1] !== shapeB[1]) {
    return false;
  }
  const [rows, columns] = shapeA;
  for (let r = 0; r < rows; r++) {
    const rowA = a[r];
    const rowB = b[r];
    for (let c = 0; c < columns; c++) {
      if (Math.abs(rowA[c] - rowB[c]) > epsilon) {
        return false;
      }
    }
  }
  return true;
}
