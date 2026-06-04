import {
  isSymmetricFiniteMatrix,
  jacobiSymmetricEigen,
  resolveIterationOptions,
  twoByTwoRealEigenvalues,
} from './jacobi-eigen.internal';
import type { IterationOptions, MatLike } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * square matrix `A`의 real eigenvalue 배열을 반환한다. 실수로 표현할 수 없는 경로는 `undefined`.
 *
 * 검증 순서: `resolveIterationOptions` → `extractMatrixShape(matrix)` → square 확인
 * → `assertFiniteMatrixEntries`. 어느 단계 실패도 결과 미생성이다.
 *
 * 분기:
 *
 *  1. `matrix = []`는 `[]`를 반환한다.
 *  2. `n === 1`은 `[a[0][0]]`를 반환한다(`-0`은 `+0`으로 canonicalize).
 *  3. `n === 2`는 characteristic polynomial closed form을 사용한다. discriminant `< -epsilon`이면
 *     complex pair로 보고 `undefined`. `[-epsilon, 0)`은 `0`으로 clamp해 repeated real eigenvalue로
 *     처리한다.
 *  4. `n >= 3`은 symmetric matrix만 처리한다. symmetry 위반(`|a[i][j] - a[j][i]| > epsilon`)은
 *     unsupported spectrum 경로로 `undefined`. nonsymmetric general QR/Schur 경로는 본 함수 범위
 *     밖이다.
 *  5. symmetric matrix는 cyclic Jacobi rotation으로 처리한다. `maxIterations` 안에 수렴하지 못하면
 *     `undefined`. 결과 diagonal은 Jacobi 결과 순서를 그대로 따른다(정렬하지 않는다).
 *
 * `matrix`는 rectangular nested square nested array여야 한다. ragged matrix와 `rows !== columns`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.maxIterations`는 positive safe integer, `options.tolerance`와 `options.epsilon`은 0 이상
 * finite number여야 한다. 위반 시 `RangeError`. options 검증은 다른 input 검증보다 먼저 수행한다.
 *
 * `tolerance`는 Jacobi off-diagonal convergence 판정에만 사용한다. `epsilon`은 2x2 discriminant
 * clamp 경계, symmetry 판정, diagonal zero cleanup에만 사용한다. input/result finite validation에는
 * 둘 다 사용하지 않는다.
 *
 * 결과 배열은 fresh storage이며 `-0`이 남지 않는다. 누적 합 / 곱 / sqrt / division 결과가 non-finite
 * 면 `RangeError`.
 *
 * @param matrix square finite matrix
 * @param options 반복 옵션. 미지정 시 default(`maxIterations=100`, `tolerance=1e-10`, `epsilon=1e-9`).
 */
export function calculateEigenvalues(matrix: MatLike, options?: IterationOptions): number[] | undefined {
  const resolved = resolveIterationOptions(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  const [rows, columns] = shape;
  if (rows !== columns) {
    throw new RangeError(`calculateEigenvalues requires a square matrix, got shape [${rows}, ${columns}]`);
  }
  assertFiniteMatrixEntries(matrix, shape, 'matrix');

  const n = rows;
  if (n === 0) {
    return [];
  }

  if (n === 1) {
    const v = matrix[0][0];
    const cleaned = Math.abs(v) <= resolved.epsilon ? 0 : v;
    return [Object.is(cleaned, -0) ? 0 : cleaned];
  }

  if (n === 2) {
    const pair = twoByTwoRealEigenvalues(matrix, resolved.epsilon);
    if (pair === undefined) {
      return undefined;
    }
    return [pair[0], pair[1]];
  }

  if (!isSymmetricFiniteMatrix(matrix, n, resolved.epsilon)) {
    return undefined;
  }

  const result = jacobiSymmetricEigen(matrix, n, resolved);
  if (result === undefined) {
    return undefined;
  }
  return result.values;
}
