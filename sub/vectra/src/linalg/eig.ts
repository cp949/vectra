import { computeNullspaceUnitVectorForLambda } from './eigenvector-nullspace.internal';
import {
  applyColumnSignConvention,
  isSymmetricFiniteMatrix,
  jacobiSymmetricEigen,
  resolveIterationOptions,
  twoByTwoRealEigenvalues,
} from './jacobi-eigen.internal';
import type { EigenDecomposition, IterationOptions, MatLike } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * square matrix `A`의 real eigenvalue와 대응 eigenvector를 함께 계산해 `EigenDecomposition`을
 * 반환한다. 실수 spectrum이 아니거나 eigenvector 하나라도 만들 수 없으면 `undefined`.
 *
 * 검증 순서: `resolveIterationOptions` → `extractMatrixShape(matrix)` → square 확인
 * → `assertFiniteMatrixEntries`. 어느 단계 실패도 결과 미생성이다.
 *
 * 분기:
 *
 *  1. `matrix = []`는 `{ values: [], vectors: [] }`를 반환한다.
 *  2. `n === 1`은 `values = [a[0][0]]`, `vectors = [[1]]`.
 *  3. symmetric `n >= 2`(`|a[i][j] - a[j][i]| <= epsilon`)은 Jacobi rotation 결과의 orthonormal
 *     column matrix V를 그대로 `vectors`로 쓴다. multiplicity가 1보다 큰 eigenvalue에서도 V의
 *     column이 서로 직교하므로 nullspace 경로처럼 동일 vector를 반복하지 않는다. 각 column에는
 *     첫 strict non-zero entry가 양수가 되도록 sign convention과 zero cleanup을 적용한다.
 *  4. nonsymmetric `n === 2`는 closed form eigenvalue를 구한다. complex pair는 `undefined`,
 *     repeated real(`|v0 - v1| <= epsilon`)은 Jordan block 의심으로 `undefined`,
 *     distinct는 각 lambda에 대해 nullspace eigenvector를 생성한다. 어느 한쪽이라도 실패하면
 *     `undefined`.
 *  5. nonsymmetric `n >= 3`은 unsupported spectrum으로 `undefined`. Hessenberg/Schur 일반 경로는
 *     본 함수 범위 밖이다.
 *
 * `EigenDecomposition.vectors`는 `n x n` column matrix다. `vectors[row][i]`가 `values[i]`에
 * 대응하는 eigenvector entry이고, 각 column은 unit norm이며 `-0`이 남지 않는다.
 *
 * `matrix`는 rectangular nested square nested array여야 한다. ragged matrix와 `rows !== columns`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.maxIterations`는 positive safe integer, `options.tolerance`와 `options.epsilon`은 0 이상
 * finite number여야 한다. 위반 시 `RangeError`. options 검증은 다른 input 검증보다 먼저 수행한다.
 *
 * `tolerance`는 symmetric `n >= 2` 경로의 Jacobi off-diagonal convergence 판정에만 사용한다.
 * `epsilon`은 symmetry 판정, 2x2 discriminant clamp 경계, 2x2 repeated 판정, nullspace pivot 판정,
 * diagonal zero cleanup, normalization zero 판정, result zero cleanup, column sign convention에
 * 쓰인다. input/result finite validation에는 둘 다 사용하지 않는다.
 *
 * 결과는 fixed plain object를 직접 반환한다(API-006). `*Into` variant를 제공하지 않는다.
 * `values`와 `vectors`는 input matrix 참조를 공유하지 않는 fresh storage이며 `-0`이 남지 않는다.
 *
 * @param matrix square finite matrix
 * @param options 반복 옵션. 미지정 시 default(`maxIterations=100`, `tolerance=1e-10`, `epsilon=1e-9`).
 */
export function eig(matrix: MatLike, options?: IterationOptions): EigenDecomposition | undefined {
  const resolved = resolveIterationOptions(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  const [rows, columns] = shape;
  if (rows !== columns) {
    throw new RangeError(`eig requires a square matrix, got shape [${rows}, ${columns}]`);
  }
  assertFiniteMatrixEntries(matrix, shape, 'matrix');

  const n = rows;
  const epsilon = resolved.epsilon;
  if (n === 0) {
    return { values: [], vectors: [] };
  }

  if (n === 1) {
    const v = matrix[0][0];
    const cleaned = Math.abs(v) <= epsilon ? 0 : v;
    const value = Object.is(cleaned, -0) ? 0 : cleaned;
    return { values: [value], vectors: [[1]] };
  }

  // symmetric 경로는 모든 n >= 2를 Jacobi로 통합한다. multiplicity > 1 eigenvalue에서도 Jacobi의
  // orthonormal V column이 서로 직교한 basis를 보장한다.
  if (isSymmetricFiniteMatrix(matrix, n, epsilon)) {
    const result = jacobiSymmetricEigen(matrix, n, resolved);
    if (result === undefined) {
      return undefined;
    }
    applyColumnSignConvention(result.vectors, n, n, epsilon);
    return { values: result.values, vectors: result.vectors };
  }

  // nonsymmetric n === 2: closed form. repeated는 Jordan block 의심이라 undefined.
  if (n === 2) {
    const pair = twoByTwoRealEigenvalues(matrix, epsilon);
    if (pair === undefined) {
      return undefined;
    }
    if (Math.abs(pair[0] - pair[1]) <= epsilon) {
      return undefined;
    }
    const v0 = computeNullspaceUnitVectorForLambda(matrix, n, pair[0], epsilon);
    const v1 = computeNullspaceUnitVectorForLambda(matrix, n, pair[1], epsilon);
    if (v0 === undefined || v1 === undefined) {
      return undefined;
    }
    const vectors: number[][] = [
      [v0[0], v1[0]],
      [v0[1], v1[1]],
    ];
    return { values: [pair[0], pair[1]], vectors };
  }

  // nonsymmetric n >= 3은 본 함수 범위 밖.
  return undefined;
}
