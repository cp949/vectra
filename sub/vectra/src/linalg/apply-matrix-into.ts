import type { MatLike, VecLike, VecWritable } from './types';
import { assertFiniteMatrixEntries, assertFiniteVector, extractMatrixShape } from './validate.internal';

/**
 * matrix-vector product `out[i] = sum_j matrix[i][j] * vector[j]`를 `out`에 기록한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * `matrix.columns`와 `vector.length`가 같지 않으면 `RangeError`.
 * 모든 matrix entry와 vector entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 모든 출력 entry(`sum_j matrix[i][j] * vector[j]`)가 finite number여야 한다. 위반 시 `RangeError`.
 * `out`은 target length `matrix.rows` 이상의 capacity가 준비되어 있어야 한다. 부족하면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(temp vector에서 계산을 완성한 뒤 commit).
 * 성공 시 `out.length`는 `matrix.rows`로 truncate된다.
 * 빈 matrix `[]`와 빈 vector `[]`은 `out.length = 0`만 설정한다.
 *
 * `out === vector` aliasing을 허용한다. temp vector에서 결과를 만든 뒤 commit한다.
 *
 * @param out matrix-vector product를 기록할 writable vector. `matrix.rows` 이상의 capacity가 준비되어 있어야 한다.
 * @param matrix 곱셈 좌측 matrix
 * @param vector 곱셈 우측 vector. `matrix.columns`와 같은 length를 가져야 한다.
 */
export function applyMatrixInto<Out extends VecWritable>(out: Out, matrix: MatLike, vector: VecLike): Out {
  const shape = extractMatrixShape(matrix, 'matrix');
  const [rows, columns] = shape;
  if (columns !== vector.length) {
    throw new RangeError(`matrix columns (${columns}) must equal vector length (${vector.length})`);
  }
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  assertFiniteVector(vector, 'vector');
  const temp = new Array<number>(rows);
  for (let i = 0; i < rows; i++) {
    const row = matrix[i];
    let sum = 0;
    for (let j = 0; j < columns; j++) {
      sum += row[j] * vector[j];
    }
    if (!Number.isFinite(sum)) {
      throw new RangeError(`sum_j matrix[${i}][j] * vector[j] must be a finite number, got ${String(sum)}`);
    }
    temp[i] = sum;
  }
  if (out.length < rows) {
    throw new RangeError(`out capacity (${out.length}) is less than rows (${rows})`);
  }
  for (let i = 0; i < rows; i++) {
    out[i] = temp[i];
  }
  out.length = rows;
  return out;
}
