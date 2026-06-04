import type { MatLike } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * 두 matrix의 모든 entry가 `===`로 같으면 `true`를 반환한다.
 *
 * 두 matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * shape가 다르면 `false`를 반환한다.
 * `+0`과 `-0`은 같다고 본다(`===` 정의와 동일).
 * 빈 matrix `[]`(`shape = [0, 0]`) 두 개는 `true`를 반환한다.
 *
 * @param a 비교할 첫 번째 matrix
 * @param b 비교할 두 번째 matrix
 */
export function equals(a: MatLike, b: MatLike): boolean {
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
      if (rowA[c] !== rowB[c]) {
        return false;
      }
    }
  }
  return true;
}
