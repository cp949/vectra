import { commitMatrixInto } from './commit-matrix.internal';
import type { MatLike, MatWritable } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * 두 matrix의 Kronecker product `out[i * b.rows + p][j * b.columns + q] = a[i][j] * b[p][q]`를 `out`에 기록한다.
 *
 * 두 matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 결과 shape `[a.rows * b.rows, a.columns * b.columns]`는 safe integer 범위여야 한다. 위반 시 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 모든 출력 entry(`a[i][j] * b[p][q]`)가 finite number여야 한다. 위반 시 `RangeError`.
 * `out`은 결과 shape에 맞는 row와 column capacity가 준비되어 있어야 한다. 부족하면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(temp matrix에서 계산을 완성한 뒤 commit).
 * 성공 시 `out.length`는 결과 row 수로, 각 row length는 결과 column 수로 truncate된다.
 * `a` 또는 `b`가 빈 matrix `[]`이면 `out.length = 0`만 설정한다.
 *
 * `out === a` 또는 `out === b` aliasing을 허용한다. temp matrix에서 결과를 만든 뒤 commit한다.
 *
 * @param out Kronecker product를 기록할 writable matrix. 결과 shape에 맞는 capacity가 준비되어 있어야 한다.
 * @param a Kronecker product의 좌측 matrix
 * @param b Kronecker product의 우측 matrix
 */
export function kroneckerProductInto<Out extends MatWritable>(out: Out, a: MatLike, b: MatLike): Out {
  const shapeA = extractMatrixShape(a, 'a');
  const shapeB = extractMatrixShape(b, 'b');
  const [aRows, aColumns] = shapeA;
  const [bRows, bColumns] = shapeB;
  // assertFiniteMatrixEntries는 rows * columns 만큼 iterate한다. 결과 shape overflow는
  // finite 검사를 시작하기 전에 검출해야 거대한 row/column count에서도 빠르게 reject할 수 있다.
  const resultRows = aRows * bRows;
  const resultColumns = aColumns * bColumns;
  if (!Number.isSafeInteger(resultRows) || !Number.isSafeInteger(resultColumns)) {
    throw new RangeError(
      `Kronecker product result shape [${aRows} * ${bRows}, ${aColumns} * ${bColumns}] exceeds safe integer range`
    );
  }
  assertFiniteMatrixEntries(a, shapeA, 'a');
  assertFiniteMatrixEntries(b, shapeB, 'b');
  if (aRows === 0 || bRows === 0) {
    commitMatrixInto(out, [], 0, 0, 'out');
    return out;
  }
  const temp: number[][] = new Array(resultRows);
  for (let i = 0; i < aRows; i++) {
    const rowA = a[i];
    for (let p = 0; p < bRows; p++) {
      const rowB = b[p];
      const tempRow = new Array<number>(resultColumns);
      for (let j = 0; j < aColumns; j++) {
        const av = rowA[j];
        const baseCol = j * bColumns;
        for (let q = 0; q < bColumns; q++) {
          const value = av * rowB[q];
          if (!Number.isFinite(value)) {
            throw new RangeError(`a[${i}][${j}] * b[${p}][${q}] must be a finite number, got ${String(value)}`);
          }
          tempRow[baseCol + q] = value;
        }
      }
      temp[i * bRows + p] = tempRow;
    }
  }
  commitMatrixInto(out, temp, resultRows, resultColumns, 'out');
  return out;
}
