import { commitMatrixInto } from './commit-matrix.internal';
import { resolveIterationOptions } from './jacobi-eigen.internal';
import { computeThinSingularValueDecomposition } from './svd.internal';
import type { IterationOptions, MatLike, MatWritable } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * `A`(`m x n`)의 column space orthonormal basis를 `out`에 기록한다.
 *
 * thin SVD의 left singular vectors `U`(`m x rank`)에서 column `i`를 row-vector basis로 전치해
 * 사용한다. basis row 개수는 `rank`이며 각 row 길이는 `m`이다. SVD policy를 따라 각 basis vector는
 * unit length이고 서로 orthogonal이다. column이 span하는 부분 공간은 input column space와 일치한다.
 *
 * 검증 순서: `resolveIterationOptions` → `extractMatrixShape(matrix)` → `assertFiniteMatrixEntries`
 * → SVD 계산 → `out` capacity 검증 → commit. 어느 단계 실패도 `out`을 호출 전 상태 그대로 둔다.
 *
 * `rank === 0`(zero matrix 포함)이면 `out.length = 0`. 빈 matrix `[]` 또는 `m === 0 || n === 0`도
 * `out.length = 0`.
 *
 * Jacobi convergence 실패와 음수 eigenvalue 같은 numeric failure는 `undefined`를 반환하고 `out`은
 * 수정하지 않는다.
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix와 one-sided zero shape `[[]]`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.maxIterations`는 positive safe integer, `options.tolerance`와 `options.epsilon`은 0 이상
 * finite number여야 한다. 위반 시 `RangeError`. `tolerance`는 Jacobi off-diagonal convergence 판정에
 * 사용한다. `epsilon`은 SVD eigenvalue clamp / sigma rank 판정 / zero cleanup에 사용한다.
 * input/result finite validation에는 둘 다 사용하지 않는다.
 *
 * repeated singular value의 basis orientation은 Jacobi 결과에 의존한다. 동일 input에 동일 option이면
 * deterministic이지만 특정 회전을 강제하지 않는다.
 *
 * `out`은 `rank` 만큼의 row capacity와 각 row에 `m` column capacity가 준비되어 있어야 한다.
 * 부족하면 `RangeError`. 성공 시 `out.length`는 `rank`, 각 row length는 `m`으로 truncate된다.
 *
 * @param out basis를 기록할 writable matrix. 실패 또는 `undefined` 반환 시 수정되지 않는다.
 * @param matrix column space를 계산할 source matrix
 * @param options 반복 옵션. 미지정 시 default(`maxIterations=100`, `tolerance=1e-10`, `epsilon=1e-9`).
 */
export function columnSpaceInto<Out extends MatWritable>(
  out: Out,
  matrix: MatLike,
  options?: IterationOptions
): Out | undefined {
  const resolved = resolveIterationOptions(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  assertFiniteMatrixEntries(matrix, shape, 'matrix');
  const [m] = shape;
  const svd = computeThinSingularValueDecomposition(matrix, shape, resolved);
  if (svd === undefined) {
    return undefined;
  }
  const { leftSingularVectors, rank } = svd;
  if (rank === 0) {
    out.length = 0;
    return out;
  }
  // basis vector i = leftSingularVectors의 column i = [U[0][i], U[1][i], ..., U[m-1][i]].
  const basis: number[][] = new Array(rank);
  for (let i = 0; i < rank; i++) {
    const vector = new Array<number>(m);
    for (let r = 0; r < m; r++) {
      vector[r] = leftSingularVectors[r][i];
    }
    basis[i] = vector;
  }
  commitMatrixInto(out, basis, rank, m, 'out');
  return out;
}
