import { resolvePivotEpsilon } from './elimination.internal';
import { performLowerTransposeBackwardSubstitution, performTriangularSubstitution } from './substitution.internal';
import type { CholeskyDecomposition, PivotOptions, VecLike } from './types';
import {
  assertFiniteMatrixEntries,
  assertFiniteVector,
  assertLowerTriangular,
  assertSquareMatrix,
  assertVectorLength,
} from './validate.internal';

/**
 * 이미 계산된 `CholeskyDecomposition`과 우변 `b`로 symmetric positive-definite system `A * x = b`의
 * 해 `x`를 forward → transposed backward substitution으로 계산해 새 `number[]`로 반환한다. `lower`
 * diagonal abs가 `epsilon` 이하이면 singular로 보고 `undefined`를 반환한다.
 *
 * decomposition은 `A = L * L^T` 형태다. caller가 푸는 system은 `L * y = b`, `L^T * x = y`로 분해된다.
 * 구현은 forward(`L * y = b`)를 `performTriangularSubstitution`으로 풀고, backward(`L^T * x = y`)는
 * transposed matrix를 새로 만들지 않고 `L[k][i]`를 그대로 읽어 `i = n-1..0` 순서로 in-place
 * backward substitution을 수행한다.
 *
 * caller는 `decomposition`이 SPD matrix에서 정상적으로 만들어졌다고 보장한다. 본 함수는 symmetry/SPD를
 * 재검증하지 않으며 lower triangular 구조와 diagonal만 검증한다.
 *
 * `decomposition.lower`는 square matrix여야 한다. nested array가 rectangular하지 않거나 square가
 * 아니면 `RangeError`. upper 영역(`column > row`)의 abs가 `epsilon`보다 크면 `RangeError`. 모든
 * entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `b`는 길이가 `n`인 finite number vector여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시 `RangeError`.
 * epsilon 검증은 다른 input 검증보다 먼저 수행한다.
 * `epsilon`은 triangular zero diagonal 판정과 triangular structural zero 판정, zero cleanup에만
 * 쓰인다. input/result finite validation에는 사용하지 않는다(tolerance-split).
 * substitution 도중 누적 합 또는 division 결과가 finite number가 아니면 `RangeError`.
 * 빈 decomposition과 빈 `b`(`lower === []`, `b.length === 0`)는 빈 solution `[]`을 반환한다.
 * 결과 entry에는 `-0`이 남지 않는다(substitution helper가 `+0`으로 canonicalize). 결과는 input
 * vector 참조를 공유하지 않는 새 `number[]`다.
 *
 * @param decomposition 이미 계산된 Cholesky decomposition. `A = L * L^T` 형태.
 * @param b 우변 벡터. `decomposition`의 `n`과 같은 길이여야 한다.
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function solveWithCholeskyDecomposition(
  decomposition: CholeskyDecomposition,
  b: VecLike,
  options?: PivotOptions
): number[] | undefined {
  const epsilon = resolvePivotEpsilon(options, 'options');
  const n = assertSquareMatrix(decomposition.lower, 'decomposition.lower');
  assertVectorLength(b, n, 'b');
  assertFiniteMatrixEntries(decomposition.lower, [n, n], 'decomposition.lower');
  assertFiniteVector(b, 'b');
  assertLowerTriangular(decomposition.lower, n, epsilon, 'decomposition.lower');

  if (n === 0) {
    return [];
  }

  const y = performTriangularSubstitution(decomposition.lower, n, (r) => b[r], epsilon, true, 'decomposition.lower');
  if (y === undefined) {
    return undefined;
  }
  return performLowerTransposeBackwardSubstitution(decomposition.lower, n, y, epsilon, 'decomposition.lower');
}
