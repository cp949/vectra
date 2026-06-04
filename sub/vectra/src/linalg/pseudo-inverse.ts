import { pseudoInverseInto } from './pseudo-inverse-into';
import type { IterationOptions, MatLike } from './types';

/**
 * rectangular matrix `A`(`m x n`)의 Moore-Penrose pseudo-inverse `A^+`를 새 `number[][]`로 반환한다.
 *
 * 결과 shape는 `n x m`이다. 빈 matrix `[]`는 `[]`를 반환한다. `rank === 0`이면 zero matrix `n x m`.
 *
 * 검증 정책과 계산 알고리즘은 `pseudoInverseInto`와 동일하다. Jacobi convergence 실패와 음수
 * eigenvalue 같은 numeric failure는 `undefined`.
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix와 one-sided zero shape `[[]]`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.maxIterations`는 positive safe integer, `options.tolerance`와 `options.epsilon`은 0 이상
 * finite number여야 한다. 위반 시 `RangeError`. `tolerance`는 Jacobi convergence 판정에 사용한다.
 * `epsilon`은 SVD eigenvalue clamp / sigma rank 판정 / pseudo-inverse zero cleanup에만 사용한다.
 * input/result finite validation에는 둘 다 사용하지 않는다.
 *
 * 결과는 input row 참조를 공유하지 않는 fresh storage이며 entry에는 `-0`이 남지 않는다.
 *
 * @param matrix pseudo-inverse를 계산할 source matrix
 * @param options 반복 옵션. 미지정 시 default(`maxIterations=100`, `tolerance=1e-10`, `epsilon=1e-9`).
 */
export function pseudoInverse(matrix: MatLike, options?: IterationOptions): number[][] | undefined {
  const rows = matrix.length;
  const firstRow = matrix[0];
  const columns = Array.isArray(firstRow) ? firstRow.length : 0;
  const outRows = rows === 0 ? 0 : columns;
  const outColumns = rows === 0 ? 0 : rows;
  const seed: number[][] = new Array(outRows);
  for (let r = 0; r < outRows; r++) {
    seed[r] = new Array<number>(outColumns);
  }
  return pseudoInverseInto(seed, matrix, options);
}
