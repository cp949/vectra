import { deepCopyMatrix, eliminateRows, resolvePivotEpsilon } from './elimination.internal';
import type { MatLike, PivotOptions } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * matrix의 numeric rank(REF pivot 개수)를 반환한다.
 *
 * partial pivoting Gaussian elimination을 REF 형태로 수행하고, pivot 후보 절대값이
 * `options.epsilon` 이하인 column은 pivot이 없는 것으로 본다. 발견된 pivot 개수를 rank로
 * 반환한다.
 *
 * rectangular wide(`rows < columns`)와 tall(`rows > columns`) matrix 모두 허용한다.
 * `matrix`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`.
 * `epsilon`은 partial pivoting의 zero pivot 판정에만 쓰인다. input/result finite validation에는
 * 사용하지 않는다.
 * elimination 도중 결과 entry가 finite number가 아니면 `RangeError`.
 * 빈 matrix `[]`는 `0`을 반환한다.
 *
 * @param matrix rank를 계산할 source matrix
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function rank(matrix: MatLike, options?: PivotOptions): number {
  const epsilon = resolvePivotEpsilon(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  const [rows, columns] = shape;
  if (rows === 0) {
    return 0;
  }
  const temp = deepCopyMatrix(matrix, rows, columns);
  return eliminateRows(temp, rows, columns, epsilon, false).rank;
}
