import { rankBasisInto } from './rank-basis-into';
import type { IterationOptions, MatLike } from './types';

/**
 * `A`(`m x n`)의 RREF pivot column에 대응하는 원본 column을 row-vector basis로 새 `number[][]`에
 * 반환한다.
 *
 * basis 정책과 검증 순서는 `rankBasisInto`와 동일하다. 새 `number[][]`를 seed로 만들어
 * `rankBasisInto`에 위임하므로 결과는 input row 참조를 공유하지 않는 fresh storage다.
 *
 * rank 0과 빈 matrix `[]`는 `[]`. 결과 entry의 `-0`은 `+0`으로 canonicalize한다.
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix와 one-sided zero shape `[[]]`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 *
 * @param matrix rank basis를 계산할 source matrix
 * @param options 반복 옵션. 미지정 시 default(`maxIterations=100`, `tolerance=1e-10`, `epsilon=1e-9`).
 */
export function rankBasis(matrix: MatLike, options?: IterationOptions): number[][] {
  // worst-case rank는 min(m, n). seed는 min(rows, columns)개 row, 각 길이 rows로 준비한다.
  const rows = matrix.length;
  const firstRow = matrix[0];
  const columns = Array.isArray(firstRow) ? firstRow.length : 0;
  const capacity = rows === 0 ? 0 : Math.min(rows, columns);
  const seed: number[][] = new Array(capacity);
  for (let i = 0; i < capacity; i++) {
    seed[i] = new Array<number>(rows);
  }
  return rankBasisInto(seed, matrix, options);
}
