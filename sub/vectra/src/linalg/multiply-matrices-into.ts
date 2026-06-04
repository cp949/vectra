import { commitMatrixInto } from './commit-matrix.internal';
import type { MatLike, MatWritable } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * 두 matrix의 곱 `out[i][j] = sum_k a[i][k] * b[k][j]`를 `out`에 기록한다.
 *
 * 두 matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * `a.columns`와 `b.rows`가 같지 않으면 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 모든 출력 entry(`sum_k a[i][k] * b[k][j]`)가 finite number여야 한다. 위반 시 `RangeError`.
 * `out`은 target shape `[a.rows, b.columns]`에 맞는 row와 column capacity가 준비되어 있어야 한다. 부족하면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(temp matrix에서 계산을 완성한 뒤 commit).
 * 성공 시 `out.length`는 `a.rows`로, 각 row length는 `b.columns`로 truncate된다.
 * 빈 matrix `[]` × `[]`은 `out.length = 0`만 설정한다.
 *
 * `out === a` 또는 `out === b` aliasing을 허용한다. temp matrix에서 결과를 만든 뒤 commit한다.
 *
 * @param out 곱을 기록할 writable matrix. target shape `[a.rows, b.columns]`에 맞는 capacity가 준비되어 있어야 한다.
 * @param a 곱셈 좌측 matrix
 * @param b 곱셈 우측 matrix. `a.columns`와 같은 row 개수를 가져야 한다.
 */
export function multiplyMatricesInto<Out extends MatWritable>(out: Out, a: MatLike, b: MatLike): Out {
  const shapeA = extractMatrixShape(a, 'a');
  const shapeB = extractMatrixShape(b, 'b');
  const [aRows, aColumns] = shapeA;
  const [bRows, bColumns] = shapeB;
  if (aColumns !== bRows) {
    throw new RangeError(`a columns (${aColumns}) must equal b rows (${bRows})`);
  }
  assertFiniteMatrixEntries(a, shapeA, 'a');
  assertFiniteMatrixEntries(b, shapeB, 'b');
  // empty × empty (양쪽 모두 [0, 0])는 결과도 [] 한 가지뿐이다.
  if (aRows === 0 || bColumns === 0) {
    commitMatrixInto(out, [], 0, 0, 'out');
    return out;
  }
  const temp: number[][] = new Array(aRows);
  for (let i = 0; i < aRows; i++) {
    const rowA = a[i];
    const tempRow = new Array<number>(bColumns);
    for (let j = 0; j < bColumns; j++) {
      let sum = 0;
      for (let k = 0; k < aColumns; k++) {
        sum += rowA[k] * b[k][j];
      }
      if (!Number.isFinite(sum)) {
        throw new RangeError(`sum_k a[${i}][k] * b[k][${j}] must be a finite number, got ${String(sum)}`);
      }
      tempRow[j] = sum;
    }
    temp[i] = tempRow;
  }
  commitMatrixInto(out, temp, aRows, bColumns, 'out');
  return out;
}
