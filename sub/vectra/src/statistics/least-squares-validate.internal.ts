/**
 * least-squares solver의 옵션/finite 검증 helper.
 *
 * epsilon 옵션 해석과 matrix/vector entry finite 검증을 모은다. `least-squares-core.internal`이
 * cross-file로 import한다.
 */

import type { LeastSquaresOptions } from './types';

/** QR rank-deficient 판정의 default tolerance. */
export const DEFAULT_LEAST_SQUARES_EPSILON = 1e-9;

/**
 * `LeastSquaresOptions.epsilon`을 검증하고 미지정 시 default(`DEFAULT_LEAST_SQUARES_EPSILON`)를 반환한다.
 *
 * `epsilon`이 NaN, Infinity, 음수이면 `RangeError`. 다른 input 검증보다 먼저 호출한다.
 *
 * @param options least-squares 옵션. `undefined`이면 default를 사용한다.
 * @param name error message에 사용할 옵션 인자 이름
 */
export function resolveLeastSquaresEpsilon(options: LeastSquaresOptions | undefined, name: string): number {
  const epsilon = options?.epsilon;
  if (epsilon === undefined) {
    return DEFAULT_LEAST_SQUARES_EPSILON;
  }
  if (!Number.isFinite(epsilon) || epsilon < 0) {
    throw new RangeError(`${name}.epsilon must be a finite number >= 0, got ${String(epsilon)}`);
  }
  return epsilon;
}

/**
 * matrix entry가 모두 finite number인지 검증한다. 위반 시 `RangeError`.
 *
 * caller는 `assertRectangularMatrix`로 얻은 shape를 전달한다.
 *
 * @param matrix 검증할 matrix
 * @param rowCount row 수
 * @param columnCount column 수
 * @param name error message에 사용할 인자 이름
 */
export function assertFiniteMatrixEntries(
  matrix: readonly (readonly number[])[],
  rowCount: number,
  columnCount: number,
  name: string
): void {
  for (let r = 0; r < rowCount; r++) {
    const row = matrix[r];
    for (let c = 0; c < columnCount; c++) {
      const value = row[c];
      if (!Number.isFinite(value)) {
        throw new RangeError(`${name}[${r}][${c}] must be a finite number, got ${String(value)}`);
      }
    }
  }
}

/**
 * vector entry가 모두 finite number인지 검증한다. 위반 시 `RangeError`.
 *
 * @param vector 검증할 vector
 * @param name error message에 사용할 인자 이름
 */
export function assertFiniteVectorEntries(vector: readonly number[], name: string): void {
  for (let i = 0; i < vector.length; i++) {
    const value = vector[i];
    if (!Number.isFinite(value)) {
      throw new RangeError(`${name}[${i}] must be a finite number, got ${String(value)}`);
    }
  }
}
