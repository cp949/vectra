import { resolvePivotEpsilon } from './elimination.internal';
import { decomposeFiniteSquareMatrixLU } from './lu-decomposition.internal';
import type { LUFactorization, MatLike, PivotOptions } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * square matrix `A`를 partial pivoting Doolittle LU factorization으로 분해해 `P * A = L * U`를
 * 만족하는 `LUFactorization`을 반환한다. singular pivot이 발견되면 `undefined`를 반환한다.
 *
 * 검증 순서: `resolvePivotEpsilon` → `extractMatrixShape(matrix)` → square 확인
 * → `assertFiniteMatrixEntries`. 어느 단계 실패도 결과 미생성.
 *
 * 알고리즘 정책은 internal helper(`decomposeFiniteSquareMatrixLU`)를 호출해 partial pivoting
 * Doolittle 방식으로 `P * A = L * U`를 계산한다. 최대 절대값 pivot이 `epsilon` 이하이면 singular로
 * `undefined`.
 *
 * `matrix`는 rectangular square nested array여야 한다. ragged matrix와 `rows !== columns`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`. epsilon 검증은 다른 input 검증보다 먼저 수행한다.
 * `epsilon`은 pivot zero 판정에만 쓰인다. input/result finite validation에는 사용하지 않는다.
 *
 * `matrix = []`는 `{ lower: [], upper: [], permutation: [], swaps: 0 }`을 반환한다.
 *
 * 결과의 `lower`, `upper`, `permutation`은 input matrix 참조를 공유하지 않는 fresh storage다.
 * `lower` diagonal entry는 정확히 `1`이며 upper 영역(`column > row`)은 정확히 `0`이다.
 * `upper` lower 영역(`column < row`)은 정확히 `0`이다. `-0`은 결과에 남지 않는다.
 *
 * 결과는 fixed plain object를 직접 반환한다. `*Into` variant를 제공하지 않는다.
 *
 * @param matrix square matrix
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function luDecomposition(matrix: MatLike, options?: PivotOptions): LUFactorization | undefined {
  const epsilon = resolvePivotEpsilon(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  const [rows, columns] = shape;
  if (rows !== columns) {
    throw new RangeError(`luDecomposition requires a square matrix, got shape [${rows}, ${columns}]`);
  }
  assertFiniteMatrixEntries(matrix, shape, 'matrix');

  return decomposeFiniteSquareMatrixLU(matrix, rows, epsilon);
}
