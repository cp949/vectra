import { commitMatrixInto } from './commit-matrix.internal';
import { deepCopyMatrix, eliminateRows, resolvePivotEpsilon } from './elimination.internal';
import type { MatLike, MatWritable, PivotOptions } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * `matrix`의 row echelon form(REF)을 `out`에 기록한다.
 *
 * partial pivoting Gaussian elimination을 수행하며, pivot row 아래(`r > pivotRow`) entry만
 * 0으로 제거한다. pivot row를 1로 normalize하지 않는다(upper triangular 형태).
 * pivot column 후보 절대값이 `options.epsilon` 이하이면 해당 column에서는 pivot을 선택하지
 * 않고 다음 column으로 이동한다. 결과 `Math.abs(value) <= epsilon`인 entry는 `0`으로 cleanup해
 * `-0`을 남기지 않는다.
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`. rectangular wide
 * (`rows < columns`)와 tall (`rows > columns`) matrix 모두 지원한다.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`.
 * elimination 도중 결과 entry가 finite number가 아니면 `RangeError`.
 * `out`은 `matrix`와 같은 shape에 맞는 row와 column capacity가 준비되어 있어야 한다. 부족하면
 * `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(temp matrix에서 계산을
 * 완성한 뒤 commit).
 * 빈 matrix `[]`는 `out.length = 0`만 설정한다.
 *
 * `out === matrix` aliasing을 허용한다. temp matrix에서 결과를 만든 뒤 commit한다.
 *
 * @param out 결과를 기록할 writable matrix. `matrix`와 같은 shape에 맞는 capacity가 준비되어
 *            있어야 한다.
 * @param matrix REF를 계산할 source matrix
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function rowEchelonFormInto<Out extends MatWritable>(out: Out, matrix: MatLike, options?: PivotOptions): Out {
  const epsilon = resolvePivotEpsilon(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  const [rows, columns] = shape;
  const temp = deepCopyMatrix(matrix, rows, columns);
  eliminateRows(temp, rows, columns, epsilon, false);
  commitMatrixInto(out, temp, rows, columns, 'out');
  return out;
}
