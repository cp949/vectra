import type { MatLike, VecWritable } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * matrix의 main diagonal `matrix[i][i]`(`i < min(rows, columns)`)을 복사해 `out`에 기록한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `out.length`가 `min(rows, columns)`보다 작으면 `RangeError`를 던지고 `out`은 수정하지 않는다.
 * 성공 시 `out[0..min(rows, columns))`에 diagonal 값을 기록하고 `out.length`는 `min(rows, columns)`로 truncate된다.
 * 빈 matrix `[]`는 `out.length = 0`만 설정한다.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(모든 validation 성공 후에만 mutate).
 *
 * @param out diagonal entry를 기록할 writable vector. capacity가 `min(rows, columns)` 이상이어야 한다.
 * @param matrix diagonal을 읽을 matrix. square가 아니어도 된다.
 */
export function diagonalInto<Out extends VecWritable>(out: Out, matrix: MatLike): Out {
  const [rows, columns] = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, [rows, columns], 'matrix');
  const diagLen = rows < columns ? rows : columns;
  if (out.length < diagLen) {
    throw new RangeError(`out capacity (${out.length}) is less than diagonal length (${diagLen})`);
  }
  for (let i = 0; i < diagLen; i++) {
    out[i] = matrix[i][i];
  }
  out.length = diagLen;
  return out;
}
