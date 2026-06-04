import { resolvePivotEpsilon } from './elimination.internal';
import { performTriangularSubstitution } from './substitution.internal';
import type { LUFactorization, PivotOptions, VecLike } from './types';
import {
  assertFiniteMatrixEntries,
  assertFiniteVector,
  assertPermutation,
  assertSquareMatrix,
  assertUnitLowerTriangular,
  assertUpperTriangular,
  assertVectorLength,
} from './validate.internal';

/**
 * 이미 계산된 `LUFactorization`과 우변 `b`로 `A * x = b`의 해 `x`를 forward → backward
 * substitution으로 계산해 새 `number[]`로 반환한다. `upper` diagonal abs가 `epsilon` 이하이면
 * singular로 보고 `undefined`를 반환한다.
 *
 * factorization은 `P * A = L * U` 형태다. `permutation[i]`는 factorized row `i`가 원본 row의 어느
 * index에서 왔는지 가리킨다. 따라서 caller가 풀려는 system은 `L * y = P * b`, `U * x = y`로 분해된다.
 * 구현은 `pb[i] = b[permutation[i]]`를 만들어 forward(`L * y = pb`) → backward(`U * x = y`) 두
 * step으로 푼다. forward step은 unit diagonal이라 singular branch가 없고, backward에서 `U`의
 * diagonal abs가 `epsilon` 이하이면 `undefined`가 전파된다.
 *
 * `factorization.lower`와 `factorization.upper`는 같은 `n x n` square matrix여야 한다. nested array
 * 자체가 rectangular하지 않거나 square가 아니면 `RangeError`. 두 matrix의 shape가 다르면 `RangeError`.
 * `lower`는 unit lower triangular여야 한다. diagonal entry가 정확히 `1`이 아니거나 upper 영역
 * (`column > row`)의 abs가 `epsilon`보다 크면 `RangeError`. `upper`는 upper triangular여야 한다.
 * lower 영역(`column < row`)의 abs가 `epsilon`보다 크면 `RangeError`. 두 matrix의 모든 entry는
 * finite number여야 한다. 위반 시 `RangeError`.
 * `factorization.permutation`은 array이고 길이가 `n`인 `[0, n)` 범위 정수의 정확한 순열이어야 한다.
 * `Array.isArray` 위반, length mismatch, non-integer entry, out-of-range entry, duplicate는 모두
 * `RangeError`.
 * `b`는 길이가 `n`인 finite number vector여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시 `RangeError`.
 * epsilon 검증은 다른 input 검증보다 먼저 수행한다.
 * `epsilon`은 triangular zero diagonal 판정과 triangular structural zero 판정, zero cleanup에만
 * 쓰인다. input/result finite validation에는 사용하지 않는다(tolerance-split).
 * substitution 도중 누적 합 또는 division 결과가 finite number가 아니면 `RangeError`.
 * 빈 factorization과 빈 `b`(`permutation.length === 0`, `lower === []`, `upper === []`,
 * `b.length === 0`)는 빈 solution `[]`을 반환한다.
 * 결과 entry에는 `-0`이 남지 않는다(substitution helper가 `+0`으로 canonicalize). 결과는 input
 * vector 참조를 공유하지 않는 새 `number[]`다.
 *
 * @param factorization 이미 계산된 LU factorization. `P * A = L * U` 형태.
 * @param b 우변 벡터. `factorization`의 `n`과 같은 길이여야 한다.
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function solveWithLuFactorization(
  factorization: LUFactorization,
  b: VecLike,
  options?: PivotOptions
): number[] | undefined {
  const epsilon = resolvePivotEpsilon(options, 'options');
  const lowerRows = assertSquareMatrix(factorization.lower, 'factorization.lower');
  const upperRows = assertSquareMatrix(factorization.upper, 'factorization.upper');
  if (lowerRows !== upperRows) {
    throw new RangeError(
      `factorization.lower (${lowerRows} x ${lowerRows}) and factorization.upper (${upperRows} x ${upperRows}) must have the same dimension`
    );
  }
  const n = lowerRows;
  assertPermutation(factorization.permutation, n, 'factorization.permutation');
  assertVectorLength(b, n, 'b');
  // shape는 square라 [n, n] 그대로 사용한다.
  assertFiniteMatrixEntries(factorization.lower, [n, n], 'factorization.lower');
  assertFiniteMatrixEntries(factorization.upper, [n, n], 'factorization.upper');
  assertFiniteVector(b, 'b');
  assertUnitLowerTriangular(factorization.lower, n, epsilon, 'factorization.lower');
  assertUpperTriangular(factorization.upper, n, epsilon, 'factorization.upper');

  if (n === 0) {
    return [];
  }

  // P*b를 만든다. permutation[i]는 factorized row i가 원본 row의 어느 index인지 가리킨다.
  const permutation = factorization.permutation;
  const y = performTriangularSubstitution(
    factorization.lower,
    n,
    (r) => b[permutation[r]],
    epsilon,
    true,
    'factorization.lower'
  );
  // unit diagonal이라 forward 단계에서는 singular branch가 발생하지 않는다. 그래도 helper 결과를
  // 그대로 전파해 가정 변경에 안전하게 둔다.
  if (y === undefined) {
    return undefined;
  }
  return performTriangularSubstitution(factorization.upper, n, (r) => y[r], epsilon, false, 'factorization.upper');
}
