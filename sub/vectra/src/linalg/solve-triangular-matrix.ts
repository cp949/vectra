import { resolvePivotEpsilon } from './elimination.internal';
import { performTriangularSubstitution } from './substitution.internal';
import type { MatLike, PivotOptions, VecLike } from './types';
import {
  assertFiniteMatrixEntries,
  assertFiniteVector,
  assertSquareMatrix,
  assertVectorLength,
} from './validate.internal';

/**
 * triangular square matrix `matrix`에 대해 `matrix * x = b`의 해 `x`를 forward 또는 backward
 * substitution으로 계산해 새 `number[]`로 반환한다. singular(diagonal 중 하나라도 abs가
 * `epsilon` 이하)이면 `undefined`를 반환한다.
 *
 * `triangle === 'lower'`이면 forward substitution을 수행한다. row `i = 0..n-1` 순서로
 * `sum = b[i] - Σ_{j<i} matrix[i][j] * x[j]`를 누적한 뒤 `x[i] = sum / matrix[i][i]`로 결정한다.
 * `triangle === 'upper'`이면 backward substitution을 수행한다. row `i = n-1..0` 순서로
 * `sum = b[i] - Σ_{j>i} matrix[i][j] * x[j]`를 누적한 뒤 `x[i] = sum / matrix[i][i]`로 결정한다.
 *
 * `triangle`은 `'lower' | 'upper'` literal union만 허용한다. runtime에서도 다른 값(`'foo'`,
 * `undefined`, `null`, number, object 등)이면 `RangeError`를 던진다. TypeScript literal union만
 * 신뢰하지 않는다.
 * `matrix`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`. `rows !== columns`이면
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `b.length`는 `matrix`의 row 수와 같아야 한다. 위반 시 `RangeError`. `b`의 모든 entry는 finite
 * number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`. epsilon 검증은 다른 input 검증보다 먼저 수행한다.
 * `epsilon`은 diagonal zero 판정과 비-삼각 영역(`triangle === 'lower'`이면 `column > row`,
 * `triangle === 'upper'`이면 `column < row`) zero 판정에만 쓰인다. input/result finite validation에는
 * 사용하지 않는다(tolerance-split).
 * 비-삼각 영역에 abs가 `epsilon`보다 큰 entry가 있으면 요청한 triangle 형태가 아니므로
 * `RangeError`를 던진다.
 * substitution 도중 누적 합 또는 division 결과가 finite number가 아니면 `RangeError`.
 * 빈 matrix `[]`와 빈 vector `[]`는 빈 solution `[]`을 반환한다.
 * 결과 entry에는 `-0`이 남지 않는다. 결과는 input vector 참조를 공유하지 않는 새 `number[]`다.
 *
 * @param matrix `matrix * x = b`의 triangular square matrix
 * @param b 우변 벡터. `matrix`의 row 수와 같은 길이여야 한다.
 * @param triangle substitution 방향. `'lower'`는 forward, `'upper'`는 backward.
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function solveTriangularMatrix(
  matrix: MatLike,
  b: VecLike,
  triangle: 'lower' | 'upper',
  options?: PivotOptions
): number[] | undefined {
  const epsilon = resolvePivotEpsilon(options, 'options');
  if (triangle !== 'lower' && triangle !== 'upper') {
    throw new RangeError(`triangle must be 'lower' or 'upper', got ${String(triangle)}`);
  }
  const n = assertSquareMatrix(matrix, 'matrix');
  assertVectorLength(b, n, 'b');
  assertFiniteMatrixEntries(matrix, [n, n], 'matrix');
  assertFiniteVector(b, 'b');
  const forward = triangle === 'lower';
  return performTriangularSubstitution(matrix, n, (r) => b[r], epsilon, forward, 'matrix');
}
