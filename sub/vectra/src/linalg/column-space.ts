import { columnSpaceInto } from './column-space-into';
import type { IterationOptions, MatLike } from './types';

/**
 * `A`(`m x n`)의 column space orthonormal basis를 새 `number[][]`로 반환한다.
 *
 * basis 정책과 검증 순서는 `columnSpaceInto`와 동일하다. 새 `number[][]`를 seed로 만들어
 * `columnSpaceInto`에 위임하므로 결과는 row 참조를 공유하지 않는 fresh storage다.
 *
 * Jacobi convergence 실패와 음수 eigenvalue 같은 numeric failure는 `undefined`를 반환한다.
 * 빈 matrix `[]`, `m === 0 || n === 0`, zero matrix는 `[]`를 반환한다.
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix와 one-sided zero shape `[[]]`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 *
 *
 * clamp/정규화/fallback 정책은 `columnSpaceInto`와 동일하다.
 * @param matrix column space를 계산할 source matrix
 * @param options 반복 옵션. 미지정 시 default(`maxIterations=100`, `tolerance=1e-10`, `epsilon=1e-9`).
 */
export function columnSpace(matrix: MatLike, options?: IterationOptions): number[][] | undefined {
  // worst-case rank는 min(m, n). seed는 min(rows, columns)개 row, 각 길이 rows로 준비한다.
  const rows = matrix.length;
  const firstRow = matrix[0];
  const columns = Array.isArray(firstRow) ? firstRow.length : 0;
  const capacity = rows === 0 ? 0 : Math.min(rows, columns);
  const seed: number[][] = new Array(capacity);
  for (let i = 0; i < capacity; i++) {
    seed[i] = new Array<number>(rows);
  }
  return columnSpaceInto(seed, matrix, options);
}
