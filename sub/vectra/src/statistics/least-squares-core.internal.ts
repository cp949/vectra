/**
 * least-squares solver의 QR-based core solver, 잔차 계산, 진입점 helper.
 *
 * `solveOverdeterminedSystem`과 후속 `calculateLinearLeastSquares` /
 * `calculateGeneralLeastSquares` wrapper가 공유한다. `linalg`/`calculus` internal helper를
 * cross-domain import하지 않고 statistics 자체 helper로 유지한다.
 */

import {
  assertFiniteMatrixEntries,
  assertFiniteVectorEntries,
  resolveLeastSquaresEpsilon,
} from './least-squares-validate.internal';
import { assertRectangularMatrix } from './matrix.internal';
import type { LeastSquaresOptions, LeastSquaresResult } from './types';
import { assertValuesArray } from './validate.internal';

/**
 * 두 finite vector의 dot product를 계산한다. 누적 합이 non-finite면 `RangeError`.
 *
 * @param a 첫 vector
 * @param b 둘째 vector
 * @param length vector 길이
 * @param context error message에 사용할 단계 이름
 */
function finiteDot(a: readonly number[], b: readonly number[], length: number, context: string): number {
  let sum = 0;
  for (let i = 0; i < length; i++) {
    sum += a[i] * b[i];
    if (!Number.isFinite(sum)) {
      throw new RangeError(`least-squares produced non-finite intermediate at ${context}, got ${String(sum)}`);
    }
  }
  return sum;
}

/**
 * vector의 ℓ2 norm을 max-scaling으로 계산한다. 누적 합/division 결과가 non-finite면 `RangeError`.
 *
 * `length === 0`이거나 모든 entry가 strict `0`이면 `0`을 반환한다. `-0` 입력도 `Math.abs`로 `0`이
 * 되어 norm은 비음의 finite number다.
 *
 * @param v finite vector
 * @param length vector 길이
 * @param context error message에 사용할 단계 이름
 */
function finiteEuclideanNorm(v: readonly number[], length: number, context: string): number {
  let max = 0;
  for (let i = 0; i < length; i++) {
    const abs = Math.abs(v[i]);
    if (abs > max) max = abs;
  }
  if (max === 0) return 0;
  let sum = 0;
  for (let i = 0; i < length; i++) {
    const s = v[i] / max;
    sum += s * s;
    if (!Number.isFinite(sum)) {
      throw new RangeError(`least-squares produced non-finite intermediate during ${context} norm, got ${String(sum)}`);
    }
  }
  const norm = max * Math.sqrt(sum);
  if (!Number.isFinite(norm)) {
    throw new RangeError(`least-squares produced non-finite ${context} norm, got ${String(norm)}`);
  }
  return norm;
}

/**
 * `A * x - b` 잔차의 ℓ2 norm을 max-scaling으로 계산한다. 비음의 finite number를 반환한다.
 *
 * row별 잔차 `A[r] · x - b[r]`을 먼저 finite 검증하고, 절대값 최대를 scale로 사용해 누적 제곱을
 * 안정적으로 합산한다. 누적합, division, 곱셈 중 하나라도 non-finite면 `RangeError`. caller는
 * `A`/`b`/`x`의 shape, finite 검증을 끝낸 뒤 호출한다.
 *
 * @param A coefficient matrix (rectangular finite)
 * @param b 우변 vector (finite, length === rowCount)
 * @param x solution vector (finite, length === columnCount)
 * @param rowCount `A`의 row 수
 * @param columnCount `A`의 column 수
 */
function computeResidualNorm(
  A: readonly (readonly number[])[],
  b: readonly number[],
  x: readonly number[],
  rowCount: number,
  columnCount: number
): number {
  const errors = new Array<number>(rowCount);
  let max = 0;
  for (let r = 0; r < rowCount; r++) {
    const row = A[r];
    let sum = -b[r];
    for (let c = 0; c < columnCount; c++) {
      const term = row[c] * x[c];
      if (!Number.isFinite(term)) {
        throw new RangeError(
          `least-squares residual produced non-finite intermediate at row ${r}, column ${c}, got ${String(term)}`
        );
      }
      sum += term;
      if (!Number.isFinite(sum)) {
        throw new RangeError(`least-squares residual accumulator overflowed at row ${r}, got ${String(sum)}`);
      }
    }
    errors[r] = sum;
    const a = Math.abs(sum);
    if (a > max) {
      max = a;
    }
  }
  if (max === 0) {
    return 0;
  }
  let scaledSum = 0;
  for (let r = 0; r < rowCount; r++) {
    const s = errors[r] / max;
    scaledSum += s * s;
    if (!Number.isFinite(scaledSum)) {
      throw new RangeError(`least-squares residual accumulator overflowed during scaling, got ${String(scaledSum)}`);
    }
  }
  const residual = max * Math.sqrt(scaledSum);
  if (!Number.isFinite(residual)) {
    throw new RangeError(`least-squares residual produced non-finite result, got ${String(residual)}`);
  }
  return residual;
}

/**
 * 검증된 rectangular finite matrix `A`(`m x n`, `m >= n`)와 finite vector `b`(`length === m`)에 대해
 * least-squares solution을 계산한다.
 *
 * 알고리즘 (modified Gram-Schmidt thin QR + back-substitution):
 *  1. column 단위로 순회하며 누적된 orthonormal column `Q_col[k]`(`k = 0..rank-1`)에 대해
 *     `R[k][j] = dot(Q_col[k], v)`로 coefficient를 추출하고 `v -= R[k][j] * Q_col[k]`로
 *     residual을 갱신한다.
 *  2. `norm = ||v||₂`. `norm <= epsilon`이면 rank-deficient로 보고 `undefined`를 반환한다.
 *  3. 그 외에는 `v`의 strict-zero가 아닌 첫 entry가 음수이면 `s = -1`, 양수이면 `s = +1`로
 *     sign을 결정해(`v[i] !== 0` strict 비교) `Q_col[r] = (s * v) / norm`,
 *     `R[r][j] = s * norm`을 기록하고 rank를 1 증가시킨다.
 *  4. column `n`개를 모두 처리해 rank가 `n`이 되면 `y = Q^T * b`를 dot product로 계산하고
 *     upper-triangular `R` back-substitution으로 `x`를 구한다.
 *  5. residual = `||A * x - b||₂`를 max-scaling으로 계산해 비음의 finite number로 보장한다.
 *  6. 결과 `coefficients`의 `-0`은 `0`으로 canonicalize한다.
 *
 * `m === 0`이면 column 수도 `0`이고(`assertRectangularMatrix` 정책상 rowCount 0이면 columnCount도 0)
 * `{ coefficients: [], residual: 0, rank: 0 }`을 반환한다. `n === 0`이면 column이 없으므로 QR/back-sub
 * 단계가 빈 루프이고 residual은 `||b||₂`다.
 *
 * 누적 sum, projection, division, norm, residual 단계 중 어느 결과라도 non-finite면 `RangeError`.
 *
 * @param A 검증이 끝난 rectangular finite matrix. `m >= n` 보장.
 * @param b 검증이 끝난 finite vector. `length === m` 보장.
 * @param epsilon QR rank-deficient 판정 tolerance. 0 이상 finite number.
 * @param rowCount `A`의 row 수 (`m`)
 * @param columnCount `A`의 column 수 (`n`)
 */
function runLeastSquaresCore(
  A: readonly (readonly number[])[],
  b: readonly number[],
  epsilon: number,
  rowCount: number,
  columnCount: number
): LeastSquaresResult | undefined {
  const m = rowCount;
  const n = columnCount;

  // QR 단계. n === 0이면 loop가 0회 돌고 qCols/rRows가 빈 상태로 진행한다.
  const qCols: number[][] = [];
  const rRows: number[][] = [];

  for (let j = 0; j < n; j++) {
    const v = new Array<number>(m);
    for (let i = 0; i < m; i++) {
      v[i] = A[i][j];
    }
    const rColumn = new Array<number>(qCols.length);
    for (let k = 0; k < qCols.length; k++) {
      const coeff = finiteDot(qCols[k], v, m, `projection at column ${j}, basis ${k}`);
      rColumn[k] = coeff;
      const qk = qCols[k];
      for (let i = 0; i < m; i++) {
        const updated = v[i] - coeff * qk[i];
        if (!Number.isFinite(updated)) {
          throw new RangeError(
            `least-squares produced non-finite QR residual at row ${i}, column ${j}, got ${String(updated)}`
          );
        }
        v[i] = updated;
      }
    }
    const norm = finiteEuclideanNorm(v, m, `column ${j}`);
    if (norm <= epsilon) {
      return undefined;
    }

    // sign convention: strict-zero가 아닌 첫 entry로 결정한다. tolerance-split 정책상
    // rank 판정 epsilon과 sign 결정의 zero 판정은 서로 다른 의미라 같은 tolerance를 공유하지
    // 않는다.
    let sign = 1;
    for (let i = 0; i < m; i++) {
      const value = v[i];
      if (value !== 0) {
        sign = value < 0 ? -1 : 1;
        break;
      }
    }

    const newQ = new Array<number>(m);
    for (let i = 0; i < m; i++) {
      const value = (sign * v[i]) / norm;
      if (!Number.isFinite(value)) {
        throw new RangeError(
          `least-squares produced non-finite Q entry at row ${i}, column ${qCols.length}, got ${String(value)}`
        );
      }
      newQ[i] = value;
    }

    const newRRow = new Array<number>(n);
    for (let jj = 0; jj < n; jj++) {
      newRRow[jj] = 0;
    }
    for (let k = 0; k < rRows.length; k++) {
      rRows[k][j] = rColumn[k];
    }
    newRRow[j] = sign * norm;

    qCols.push(newQ);
    rRows.push(newRRow);
  }

  // y = Q^T * b. n === 0이면 빈 배열.
  const y = new Array<number>(n);
  for (let k = 0; k < n; k++) {
    y[k] = finiteDot(qCols[k], b, m, `Q^T b at basis ${k}`);
  }

  // R * x = y back-substitution.
  const x = new Array<number>(n);
  for (let j = n - 1; j >= 0; j--) {
    let s = y[j];
    for (let k = j + 1; k < n; k++) {
      s -= rRows[j][k] * x[k];
      if (!Number.isFinite(s)) {
        throw new RangeError(`least-squares produced non-finite back-substitution at index ${j}, got ${String(s)}`);
      }
    }
    const diagonal = rRows[j][j];
    const value = s / diagonal;
    if (!Number.isFinite(value)) {
      throw new RangeError(`least-squares produced non-finite coefficient at index ${j}, got ${String(value)}`);
    }
    x[j] = value;
  }

  const residual = computeResidualNorm(A, b, x, m, n);

  // result coefficients의 -0을 +0으로 canonicalize한다. fresh 배열을 만들어 caller에 넘긴다.
  const coefficients = new Array<number>(n);
  for (let j = 0; j < n; j++) {
    const value = x[j];
    coefficients[j] = Object.is(value, -0) ? 0 : value;
  }

  return { coefficients, residual, rank: n };
}

/**
 * matrix `A`(`m x n`)와 vector `b`(`length === m`)에 대해 least-squares solution을 계산한다.
 *
 * 검증 순서: `resolveLeastSquaresEpsilon(options)` → `assertRectangularMatrix(A)` →
 * `assertValuesArray(b)` → `b.length === rowCount` → `rowCount >= columnCount` →
 * `assertFiniteMatrixEntries(A)` → `assertFiniteVectorEntries(b)` → core. 어느 단계 실패도 결과
 * 미생성이다.
 *
 * full column rank이면 `{ coefficients, residual, rank }`를 반환한다. rank-deficient이면 `undefined`.
 * `A = []` 또는 `m x 0` shape는 column 수가 `0`이라 rank 판정 단계가 없고 결과는 항상
 * `{ coefficients: [], residual, rank: 0 }`이다.
 *
 * `rowCount < columnCount`(underdetermined 형태)는 `RangeError`. caller가 underdetermined 케이스가
 * 필요하면 별도 API를 사용해야 한다.
 *
 * @param A coefficient matrix. row-major `readonly (readonly number[])[]`.
 * @param b 우변 vector. length는 `A`의 row 수와 같다.
 * @param options least-squares 옵션. `epsilon` 미지정 시 default(`1e-9`).
 * @param matrixName error message에 사용할 matrix 인자 이름
 * @param vectorName error message에 사용할 vector 인자 이름
 */
export function solveLeastSquares(
  A: readonly (readonly number[])[],
  b: readonly number[],
  options: LeastSquaresOptions | undefined,
  matrixName: string,
  vectorName: string
): LeastSquaresResult | undefined {
  const epsilon = resolveLeastSquaresEpsilon(options, 'options');
  const { rowCount, columnCount } = assertRectangularMatrix(A, matrixName);
  assertValuesArray(b, vectorName);
  if (b.length !== rowCount) {
    throw new RangeError(`${vectorName}.length must equal ${matrixName} row count, got ${b.length} vs ${rowCount}`);
  }
  if (rowCount < columnCount) {
    throw new RangeError(
      `${matrixName} must be overdetermined (rows >= columns), got rows=${rowCount}, columns=${columnCount}`
    );
  }
  assertFiniteMatrixEntries(A, rowCount, columnCount, matrixName);
  assertFiniteVectorEntries(b, vectorName);

  return runLeastSquaresCore(A, b, epsilon, rowCount, columnCount);
}
