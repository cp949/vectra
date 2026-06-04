import { computeNullspaceUnitVectorForLambda } from './eigenvector-nullspace.internal';
import { resolveIterationOptions } from './jacobi-eigen.internal';
import type { IterationOptions, MatLike } from './types';
import { assertFiniteMatrixEntries, assertFiniteNumber, extractMatrixShape } from './validate.internal';

/**
 * square matrix `A`와 후보 eigenvalue `lambda`에 대해 `(A - lambda * I) * v = 0`의 nullspace에서
 * deterministic unit vector 1개를 반환한다. `lambda`가 eigenvalue가 아니거나 numeric failure이면
 * `undefined`.
 *
 * 검증 순서: `resolveIterationOptions` → `assertFiniteNumber(lambda)` → `extractMatrixShape(matrix)`
 * → square 확인 → `assertFiniteMatrixEntries`. 어느 단계 실패도 결과 미생성이다.
 *
 * 분기:
 *
 *  1. `matrix = []`는 항상 `undefined`(0차원 vector를 반환할 수 없다).
 *  2. RREF의 pivot count가 `n`과 같으면 unique zero solution이므로 `lambda`는 eigenvalue가 아니다.
 *     `undefined`.
 *  3. 그 외에는 가장 큰 index의 free variable을 `1`로 두고 back-solve로 nullspace vector 1개를 만든다.
 *     Euclidean norm으로 normalize한 뒤 첫 strict non-zero entry가 양수가 되도록 sign을 고정한다.
 *  4. normalize 단계에서 norm이 `epsilon` 이하이면 numeric failure로 `undefined`.
 *
 * `matrix`는 rectangular nested square nested array여야 한다. ragged matrix와 `rows !== columns`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`. `lambda`는 finite number
 * 여야 한다. NaN, Infinity는 `RangeError`. `options.maxIterations`는 positive safe integer,
 * `options.tolerance`와 `options.epsilon`은 0 이상 finite number여야 한다. 위반 시 `RangeError`.
 * options 검증은 다른 input 검증보다 먼저 수행한다.
 *
 * `tolerance`는 본 함수에서 직접 사용하지 않는다(`eig`/iterative path와의 옵션 일관성을 위해 받는다).
 * `epsilon`은 RREF pivot zero 판정, nullspace pivot 판정, normalization zero 판정, zero cleanup에
 * 쓰인다. input/result finite validation에는 사용하지 않는다.
 *
 * 결과 vector는 fresh storage이며 `-0`이 남지 않는다. 누적 합 / 곱 / division 결과가 non-finite면
 * `RangeError`.
 *
 * @param matrix square finite matrix
 * @param lambda eigenvalue 후보. finite number.
 * @param options 반복 옵션. 미지정 시 default(`maxIterations=100`, `tolerance=1e-10`, `epsilon=1e-9`).
 */
export function eigenvectorForEigenvalue(
  matrix: MatLike,
  lambda: number,
  options?: IterationOptions
): number[] | undefined {
  const resolved = resolveIterationOptions(options, 'options');
  assertFiniteNumber(lambda, 'lambda');
  const shape = extractMatrixShape(matrix, 'matrix');
  const [rows, columns] = shape;
  if (rows !== columns) {
    throw new RangeError(`eigenvectorForEigenvalue requires a square matrix, got shape [${rows}, ${columns}]`);
  }
  assertFiniteMatrixEntries(matrix, shape, 'matrix');

  const n = rows;
  if (n === 0) {
    return undefined;
  }
  return computeNullspaceUnitVectorForLambda(matrix, n, lambda, resolved.epsilon);
}
