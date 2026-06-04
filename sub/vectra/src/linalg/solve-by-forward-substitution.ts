import { resolvePivotEpsilon } from './elimination.internal';
import { performTriangularSubstitution } from './substitution.internal';
import type { MatLike, PivotOptions, VecLike } from './types';
import {
  assertFiniteMatrixEntries,
  assertFiniteVector,
  assertVectorLength,
  extractMatrixShape,
} from './validate.internal';

/**
 * lower triangular square matrix `L`에 대해 `L * x = b`의 해 `x`를 forward substitution으로
 * 계산해 새 `number[]`로 반환한다. singular(diagonal 중 하나라도 abs가 `epsilon` 이하)이면
 * `undefined`를 반환한다.
 *
 * row `i = 0..n-1` 순서로 진행한다. 각 row에서 `sum = b[i] - Σ_{j<i} L[i][j] * x[j]`를 누적한
 * 뒤 `x[i] = sum / L[i][i]`로 결정한다.
 *
 * `L`은 rectangular nested array여야 한다. ragged matrix는 `RangeError`. `rows !== columns`이면
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `b.length`는 `L`의 row 수와 같아야 한다. 위반 시 `RangeError`. `b`의 모든 entry는 finite
 * number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`. epsilon 검증은 다른 input 검증보다 먼저 수행한다.
 * `epsilon`은 diagonal zero 판정과 upper 영역(`column > row`) zero 판정에만 쓰인다.
 * input/result finite validation에는 사용하지 않는다.
 * `L`의 upper 영역(`column > row`)에 abs가 `epsilon`보다 큰 entry가 있으면 lower triangular이
 * 아니므로 `RangeError`를 던진다.
 * substitution 도중 누적 합 또는 division 결과가 finite number가 아니면 `RangeError`.
 * 빈 matrix `[]`와 빈 vector `[]`는 빈 solution `[]`을 반환한다.
 * 결과 entry에는 `-0`이 남지 않는다. 결과는 input vector 참조를 공유하지 않는 새 `number[]`다.
 *
 * @param L `L * x = b`의 lower triangular square matrix
 * @param b 우변 벡터. `L`의 row 수와 같은 길이여야 한다.
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function solveByForwardSubstitution(L: MatLike, b: VecLike, options?: PivotOptions): number[] | undefined {
  const epsilon = resolvePivotEpsilon(options, 'options');
  const shape = extractMatrixShape(L, 'L');
  const [rows, columns] = shape;
  if (rows !== columns) {
    throw new RangeError(`solveByForwardSubstitution requires a square matrix, got shape [${rows}, ${columns}]`);
  }
  assertVectorLength(b, rows, 'b');
  assertFiniteMatrixEntries(L, shape, 'L');
  assertFiniteVector(b, 'b');
  return performTriangularSubstitution(L, rows, (r) => b[r], epsilon, true, 'L');
}
