import { commitMatrixInto } from './commit-matrix.internal';
import type { MatLike, MatWritable } from './types';
import { assertFiniteMatrixEntries, assertRowIndex, extractMatrixShape } from './validate.internal';

/**
 * `matrix`의 `first`와 `second` row를 swap한 결과를 `out`에 기록한다.
 *
 * `first === second`이면 no-op로 처리하며 원본을 그대로 복사한다.
 * `matrix`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `first`, `second`는 `0 <= index < rows`인 정수여야 한다. NaN, Infinity, 비정수, 음수, 범위
 * 초과는 `RangeError`.
 * `out`은 `matrix`와 같은 shape에 맞는 row와 column capacity가 준비되어 있어야 한다. 부족하면
 * `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(temp matrix에서 계산을
 * 완성한 뒤 commit).
 *
 * `out === matrix` aliasing을 허용한다. temp matrix에서 결과를 만든 뒤 commit한다.
 *
 * @param out 결과를 기록할 writable matrix. `matrix`와 같은 shape에 맞는 capacity가 준비되어
 *            있어야 한다.
 * @param matrix row 교환을 적용할 source matrix
 * @param first 교환할 첫 row index. 0-based 정수.
 * @param second 교환할 두 번째 row index. 0-based 정수.
 */
export function exchangeRowsInto<Out extends MatWritable>(
  out: Out,
  matrix: MatLike,
  first: number,
  second: number
): Out {
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  const [rows, columns] = shape;
  assertRowIndex(first, rows, 'first');
  assertRowIndex(second, rows, 'second');
  const temp: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    let sourceRow: readonly number[];
    if (r === first) {
      sourceRow = matrix[second];
    } else if (r === second) {
      sourceRow = matrix[first];
    } else {
      sourceRow = matrix[r];
    }
    const tempRow = new Array<number>(columns);
    for (let c = 0; c < columns; c++) {
      tempRow[c] = sourceRow[c];
    }
    temp[r] = tempRow;
  }
  commitMatrixInto(out, temp, rows, columns, 'out');
  return out;
}
