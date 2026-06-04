import { applyMatrixInto } from './apply-matrix-into';
import type { MatLike, VecLike } from './types';

/**
 * matrix-vector product `[sum_j matrix[i][j] * vector[j]]`를 새 `number[]`로 반환한다.
 *
 * matrix는 rectangular nested array여야 한다. ragged matrix는 `RangeError`.
 * `matrix.columns`와 `vector.length`가 같지 않으면 `RangeError`.
 * 모든 matrix entry와 vector entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 모든 출력 entry(`sum_j matrix[i][j] * vector[j]`)가 finite number여야 한다. 위반 시 `RangeError`.
 * 빈 matrix `[]`와 빈 vector `[]`은 빈 배열 `[]`을 반환한다.
 *
 * @param matrix 곱셈 좌측 matrix
 * @param vector 곱셈 우측 vector. `matrix.columns`와 같은 length를 가져야 한다.
 */
export function applyMatrix(matrix: MatLike, vector: VecLike): number[] {
  const rows = matrix.length;
  const out: number[] = new Array(rows);
  return applyMatrixInto(out, matrix, vector);
}
