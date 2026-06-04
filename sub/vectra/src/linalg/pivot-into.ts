import { commitMatrixInto } from './commit-matrix.internal';
import { deepCopyMatrix, partialPivotReorder, resolvePivotEpsilon } from './elimination.internal';
import type { MatLike, MatWritable, PivotOptions } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * `matrix`에 partial pivoting row reordering을 적용한 결과를 `out`에 기록한다.
 *
 * `min(rows, columns)`개의 diagonal에 대해, 각 diagonal `i`에서 column `i`를 보고 `r >= i`인
 * 행 중 `Math.abs(matrix[r][i])`가 최대인 row와 row `i`를 swap한다. 최대 절대값이
 * `options.epsilon` 이하이면 해당 diagonal에서는 swap하지 않는다. 결과는 row 순서만 변한
 * matrix이며 entry 값은 변하지 않는다(elimination을 수행하지 않는다).
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`.
 * `out`은 `matrix`와 같은 shape에 맞는 row와 column capacity가 준비되어 있어야 한다. 부족하면
 * `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(temp matrix에서 계산을
 * 완성한 뒤 commit).
 * 빈 matrix `[]`(`shape = [0, 0]`)는 `out.length = 0`만 설정한다.
 *
 * `out === matrix` aliasing을 허용한다. temp matrix에서 결과를 만든 뒤 commit한다.
 *
 * @param out 결과를 기록할 writable matrix. `matrix`와 같은 shape에 맞는 capacity가 준비되어
 *            있어야 한다.
 * @param matrix partial pivoting을 적용할 source matrix
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function pivotInto<Out extends MatWritable>(out: Out, matrix: MatLike, options?: PivotOptions): Out {
  const epsilon = resolvePivotEpsilon(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  const [rows, columns] = shape;
  const temp = deepCopyMatrix(matrix, rows, columns);
  partialPivotReorder(temp, rows, columns, epsilon);
  commitMatrixInto(out, temp, rows, columns, 'out');
  return out;
}
