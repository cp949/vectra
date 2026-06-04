import { resolvePivotEpsilon } from './elimination.internal';
import type { CholeskyDecomposition, MatLike, PivotOptions } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * symmetric positive-definite square matrix `A`를 lower triangular `L`로 분해해 `A = L * L^T`를
 * 만족하는 `CholeskyDecomposition`을 반환한다. positive-definite 조건을 만족하지 않으면
 * `undefined`를 반환한다.
 *
 * 검증 순서: `resolvePivotEpsilon` → `extractMatrixShape(matrix)` → square 확인
 * → `assertFiniteMatrixEntries` → symmetry 확인. 어느 단계 실패도 결과 미생성이다.
 *
 * 알고리즘 (Cholesky–Banachiewicz, row-by-row):
 *  1. 빈 matrix `[]`는 `{ lower: [] }`를 반환한다.
 *  2. `i = 0..n-1`에 대해 row 단위로 `L[i][0..i]`를 계산한다.
 *     - `j < i`: `L[i][j] = (a[i][j] - Σ_{k=0..j-1} L[i][k] * L[j][k]) / L[j][j]`.
 *     - `j === i`: `L[i][i] = sqrt(a[i][i] - Σ_{k=0..i-1} L[i][k]^2)`.
 *     - `j > i`: 0으로 채운다.
 *  3. 누적 sum과 division/sqrt 결과가 non-finite면 `RangeError`.
 *  4. diagonal 계산 `value = a[i][i] - sum`이 `epsilon` 이하이면 positive-definite 위반으로
 *     `undefined`.
 *
 * `matrix`는 rectangular nested square nested array여야 한다. ragged matrix와 `rows !== columns`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * symmetry는 `Math.abs(a[i][j] - a[j][i]) <= epsilon`으로 판정한다. 위반은 structural precondition
 * 위반이므로 `RangeError`. `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시
 * default(`1e-9`). 위반 시 `RangeError`. epsilon 검증은 다른 input 검증보다 먼저 수행한다.
 *
 * `epsilon`은 symmetry 판정, positive-definite pivot 판정, zero cleanup에만 쓰인다. input/result
 * finite validation에는 사용하지 않는다.
 *
 * 결과의 `lower`는 input matrix 참조를 공유하지 않는 fresh storage다. upper 영역(`column > row`)은
 * 정확히 `0`이며 `-0`은 결과에 남지 않는다(`Object.is(value, -0)` 위치만 `+0`으로 canonicalize).
 *
 * 결과는 fixed plain object를 직접 반환한다. `*Into` variant를 제공하지 않는다.
 *
 * @param matrix square symmetric positive-definite matrix
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function choleskyDecomposition(matrix: MatLike, options?: PivotOptions): CholeskyDecomposition | undefined {
  const epsilon = resolvePivotEpsilon(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  const [rows, columns] = shape;
  if (rows !== columns) {
    throw new RangeError(`choleskyDecomposition requires a square matrix, got shape [${rows}, ${columns}]`);
  }
  assertFiniteMatrixEntries(matrix, shape, 'matrix');

  const n = rows;
  if (n === 0) {
    return { lower: [] };
  }

  for (let r = 0; r < n; r++) {
    for (let c = r + 1; c < n; c++) {
      if (Math.abs(matrix[r][c] - matrix[c][r]) > epsilon) {
        throw new RangeError(
          `choleskyDecomposition requires a symmetric matrix, [${r}][${c}] (${matrix[r][c]}) and [${c}][${r}] (${matrix[c][r]}) differ`
        );
      }
    }
  }

  const lower: number[][] = new Array(n);
  for (let i = 0; i < n; i++) {
    lower[i] = new Array<number>(n);
    for (let j = 0; j < n; j++) {
      lower[i][j] = 0;
    }
  }

  for (let i = 0; i < n; i++) {
    const lRowI = lower[i];
    for (let j = 0; j <= i; j++) {
      const lRowJ = lower[j];
      let sum = 0;
      for (let k = 0; k < j; k++) {
        sum += lRowI[k] * lRowJ[k];
        if (!Number.isFinite(sum)) {
          throw new RangeError(
            `choleskyDecomposition produced non-finite intermediate at [${i}][${j}], got ${String(sum)}`
          );
        }
      }
      const remainder = matrix[i][j] - sum;
      // safety net. matrix[i][j]와 sum 모두 finite 보장(사전 검증 + sum loop의 finite check)이라
      // 현재 가정 아래에서는 unreachable. 검증 순서가 바뀌면 silent NaN 대신 RangeError로 막는다.
      if (!Number.isFinite(remainder)) {
        throw new RangeError(
          `choleskyDecomposition produced non-finite remainder at [${i}][${j}], got ${String(remainder)}`
        );
      }
      if (i === j) {
        if (remainder <= epsilon) {
          return undefined;
        }
        const diag = Math.sqrt(remainder);
        // safety net. remainder > epsilon >= 0이고 finite라 Math.sqrt는 항상 finite. epsilon 0 허용 등
        // 가정 변경 시 silent NaN 대신 RangeError로 막는다.
        if (!Number.isFinite(diag)) {
          throw new RangeError(
            `choleskyDecomposition produced non-finite diagonal at [${i}][${i}], got ${String(diag)}`
          );
        }
        lRowI[i] = diag;
      } else {
        const value = remainder / lRowJ[j];
        if (!Number.isFinite(value)) {
          throw new RangeError(`choleskyDecomposition produced non-finite value at [${i}][${j}], got ${String(value)}`);
        }
        lRowI[j] = Object.is(value, -0) ? 0 : value;
      }
    }
  }

  return { lower };
}
