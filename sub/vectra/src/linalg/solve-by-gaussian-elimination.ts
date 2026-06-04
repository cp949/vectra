import { eliminateRows, resolvePivotEpsilon } from './elimination.internal';
import type { LinearSolveResult, MatLike, PivotOptions, VecLike } from './types';
import {
  assertFiniteMatrixEntries,
  assertFiniteVector,
  assertVectorLength,
  extractMatrixShape,
} from './validate.internal';

/**
 * 선형 시스템 `A * x = b`를 Gaussian elimination으로 풀어 `LinearSolveResult` union을 반환한다.
 *
 * 검증 순서: `resolvePivotEpsilon` → `extractMatrixShape(A)` → `assertVectorLength(b, A.rows)` →
 * `assertFiniteMatrixEntries(A)` → `assertFiniteVector(b)` → 분류. 어느 단계 실패도 결과 미생성.
 *
 * 알고리즘:
 *  1. fresh `[A | b]` augmented matrix를 직접 구성한다.
 *  2. `eliminateRows(..., reduced = true)`로 partial pivoting RREF를 만든다.
 *  3. coefficient 영역의 row별 leading entry(`Math.abs(value) > epsilon`)를 pivot column으로
 *     수집한다. coefficient가 모두 epsilon 이하인 row의 RHS abs가 epsilon보다 크면 inconsistent
 *     row로 본다.
 *  4. 분류 우선순위: inconsistent → unique(pivot count === unknown count) → underdetermined.
 *  5. unique 결과에서 `A.rows > A.columns`이면 원본 `A`와 `b`로 잔차 `||A * x - b||₂`를 계산해
 *     `overdetermined`로 다시 분류한다. residual 계산은 max scaling으로 overflow를 회피한다.
 *     누적합 또는 division 결과가 non-finite이면 `RangeError`.
 *
 * `A`는 rectangular nested array여야 한다. ragged matrix는 `RangeError`. 모든 entry는 finite
 * number여야 한다. 위반 시 `RangeError`. `b.length`는 `A`의 row 수와 같아야 한다. 위반 시
 * `RangeError`. `b`의 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`. epsilon 검증은 다른 input 검증보다 먼저 수행한다.
 * `epsilon`은 pivot zero 판정, elimination zero cleanup, pivot/RHS zero 분류에만 쓰인다.
 * input/result finite validation과 residual 계산에는 사용하지 않는다.
 *
 * `A = []`, `b = []`는 unknown count 0인 unique solution `{ type: 'unique', solution: [] }`을
 * 반환한다.
 *
 * `solution`, `rref`에는 `-0`이 남지 않는다. `rref`는 fresh deep copy이며, `pivotColumns`는
 * coefficient column index의 ascending 정렬이다. residual은 비음의 finite number다.
 *
 * 이 함수는 public `augment*`, `reducedRowEchelonForm*` 또는 다른 public leaf를 참조하지 않는다.
 * augmented matrix 구성과 분류 로직은 file-local helper로 처리한다.
 *
 * @param A 계수 matrix
 * @param b 우변 벡터. `A`의 row 수와 같은 길이여야 한다.
 * @param options pivot 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function solveByGaussianElimination(A: MatLike, b: VecLike, options?: PivotOptions): LinearSolveResult {
  const epsilon = resolvePivotEpsilon(options, 'options');
  const shape = extractMatrixShape(A, 'A');
  const [aRows, aColumns] = shape;
  assertVectorLength(b, aRows, 'b');
  assertFiniteMatrixEntries(A, shape, 'A');
  assertFiniteVector(b, 'b');

  if (aRows === 0) {
    return { type: 'unique', solution: [] };
  }

  const augColumns = aColumns + 1;
  const temp = buildAugmentedMatrix(A, b, aRows, aColumns);
  eliminateRows(temp, aRows, augColumns, epsilon, true);

  const pivotColumns: number[] = [];
  const pivotRows: number[] = [];
  let inconsistent = false;
  for (let r = 0; r < aRows; r++) {
    const row = temp[r];
    let pivotCol = -1;
    for (let c = 0; c < aColumns; c++) {
      if (Math.abs(row[c]) > epsilon) {
        pivotCol = c;
        break;
      }
    }
    if (pivotCol === -1) {
      if (Math.abs(row[aColumns]) > epsilon) {
        inconsistent = true;
      }
      continue;
    }
    pivotColumns.push(pivotCol);
    pivotRows.push(r);
  }

  if (inconsistent) {
    canonicalizeNegativeZeroInPlace(temp, aRows, augColumns);
    return { type: 'inconsistent', rref: temp };
  }

  if (pivotColumns.length === aColumns) {
    const solution = new Array<number>(aColumns);
    for (let i = 0; i < aColumns; i++) {
      solution[i] = 0;
    }
    for (let i = 0; i < pivotColumns.length; i++) {
      const pc = pivotColumns[i];
      const pr = pivotRows[i];
      const value = temp[pr][aColumns];
      solution[pc] = value === 0 ? 0 : value;
    }
    if (aRows > aColumns) {
      const residual = computeResidual(A, b, solution, aRows, aColumns);
      return { type: 'overdetermined', solution, residual };
    }
    return { type: 'unique', solution };
  }

  canonicalizeNegativeZeroInPlace(temp, aRows, augColumns);
  return { type: 'underdetermined', rref: temp, pivotColumns };
}

/**
 * `[A | b]` 모양의 fresh augmented matrix를 새 `number[][]`로 만든다.
 *
 * caller가 `A`, `b`의 shape/finite 검증을 끝낸 뒤 호출한다. 마지막 column이 `b`다.
 */
function buildAugmentedMatrix(A: MatLike, b: VecLike, rows: number, coefficientColumns: number): number[][] {
  const columns = coefficientColumns + 1;
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    const src = A[r];
    const row = new Array<number>(columns);
    for (let c = 0; c < coefficientColumns; c++) {
      row[c] = src[c];
    }
    row[coefficientColumns] = b[r];
    out[r] = row;
  }
  return out;
}

/**
 * RREF temp에서 `-0`을 `+0`으로 canonicalize한다. underdetermined/inconsistent 분기 결과에 사용.
 *
 * caller가 fresh `number[][]` ownership을 helper에 넘긴 상태에서만 호출한다.
 */
function canonicalizeNegativeZeroInPlace(matrix: number[][], rows: number, columns: number): void {
  for (let r = 0; r < rows; r++) {
    const row = matrix[r];
    for (let c = 0; c < columns; c++) {
      if (row[c] === 0) {
        row[c] = 0;
      }
    }
  }
}

/**
 * unique 분류된 solution을 원본 `A`, `b`에 대입해 `||A * x - b||₂`를 max scaling으로 계산한다.
 *
 * row별 잔차 `A[r] · x - b[r]`을 모은 뒤 `euclideanNorm`과 동일한 max scaling 누적식
 * `max * sqrt(Σ (e_r / max)²)`을 적용한다. 곱셈, 누적합, division 중 어느 단계라도 non-finite
 * 결과가 나오면 `RangeError`. 모든 row의 잔차 abs가 정확히 `0`이면 `0`을 반환한다.
 *
 * caller가 `A`/`b`/`solution`의 shape, finite 검증을 끝낸 뒤 호출한다. 결과는 비음의 finite
 * number다.
 */
function computeResidual(A: MatLike, b: VecLike, solution: number[], rows: number, coefficientColumns: number): number {
  const errors = new Array<number>(rows);
  let max = 0;
  for (let r = 0; r < rows; r++) {
    const row = A[r];
    let sum = -b[r];
    for (let c = 0; c < coefficientColumns; c++) {
      const term = row[c] * solution[c];
      if (!Number.isFinite(term)) {
        throw new RangeError(
          `residual computation produced non-finite intermediate at row ${r}, column ${c}, got ${String(term)}`
        );
      }
      sum += term;
      if (!Number.isFinite(sum)) {
        throw new RangeError(`residual computation accumulator overflowed at row ${r}, got ${String(sum)}`);
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
  for (let r = 0; r < rows; r++) {
    const s = errors[r] / max;
    scaledSum += s * s;
    if (!Number.isFinite(scaledSum)) {
      throw new RangeError(`residual computation accumulator overflowed during scaling, got ${String(scaledSum)}`);
    }
  }
  const residual = max * Math.sqrt(scaledSum);
  if (!Number.isFinite(residual)) {
    throw new RangeError(`residual computation produced non-finite result, got ${String(residual)}`);
  }
  return residual;
}
