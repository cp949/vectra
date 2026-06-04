import type { MatLike } from './types';

/**
 * triangular substitution의 RHS source. row index를 받아 그 row의 RHS scalar를 반환한다.
 *
 * vector variant는 `(r) => b[r]`, augmented variant는 `(r) => augmented[r][columns - 1]`로
 * 호출자가 합성한다.
 */
export type SubstitutionRhsReader = (rowIndex: number) => number;

/**
 * triangular substitution의 공통 코어. caller가 shape, square, finite, RHS source 검증을 모두
 * 끝낸 뒤 호출한다.
 *
 * `forward = true`이면 lower triangular `L`에 대해 forward substitution을 수행한다.
 *  - row `i = 0..rows-1` 순서로 진행한다.
 *  - 각 row에서 `j < i`인 column의 entry만 누적 합 차감에 사용한다.
 *  - `j > i` 영역(upper)의 entry는 모두 `Math.abs(value) <= epsilon`이어야 한다.
 *
 * `forward = false`이면 upper triangular `U`에 대해 backward substitution을 수행한다.
 *  - row `i = rows-1..0` 순서로 진행한다.
 *  - 각 row에서 `j > i`인 column의 entry만 누적 합 차감에 사용한다.
 *  - `j < i` 영역(lower)의 entry는 모두 `Math.abs(value) <= epsilon`이어야 한다.
 *
 * 비-삼각 영역의 entry abs가 `epsilon`보다 크면 `RangeError`를 던진다. diagonal abs가
 * `epsilon` 이하이면 singular로 보고 `undefined`를 반환한다. 누적 합산 또는 division 결과가
 * non-finite이면 `RangeError`를 던진다.
 *
 * 반환 entry에 `-0`은 남기지 않는다(`v === 0`이면 `+0`으로 canonicalize). `rows === 0`이면
 * `[]`을 반환한다.
 *
 * @param matrix 이미 shape/finite 검증을 마친 square triangular matrix(또는 augmented의 coefficient 영역)
 * @param rows substitution 차원. coefficient column 수도 같다.
 * @param rhs row index를 받아 RHS scalar를 반환하는 reader
 * @param epsilon diagonal zero / 비-삼각 영역 zero 판정 tolerance
 * @param forward `true`이면 forward, `false`이면 backward substitution
 * @param matrixName error message에 사용할 matrix 인자 이름
 */
export function performTriangularSubstitution(
  matrix: MatLike,
  rows: number,
  rhs: SubstitutionRhsReader,
  epsilon: number,
  forward: boolean,
  matrixName: string
): number[] | undefined {
  if (rows === 0) {
    return [];
  }

  // 비-삼각 영역(upper for forward, lower for backward)에 epsilon보다 큰 entry가 있는지 검사한다.
  for (let r = 0; r < rows; r++) {
    const row = matrix[r];
    if (forward) {
      for (let c = r + 1; c < rows; c++) {
        const v = row[c];
        if (Math.abs(v) > epsilon) {
          throw new RangeError(`${matrixName} is not lower triangular: [${r}][${c}] = ${String(v)} exceeds epsilon`);
        }
      }
    } else {
      for (let c = 0; c < r; c++) {
        const v = row[c];
        if (Math.abs(v) > epsilon) {
          throw new RangeError(`${matrixName} is not upper triangular: [${r}][${c}] = ${String(v)} exceeds epsilon`);
        }
      }
    }
  }

  const x = new Array<number>(rows);
  const start = forward ? 0 : rows - 1;
  const step = forward ? 1 : -1;
  for (let n = 0; n < rows; n++) {
    const i = start + step * n;
    const row = matrix[i];
    let sum = rhs(i);
    const jStart = forward ? 0 : i + 1;
    const jEnd = forward ? i : rows;
    for (let j = jStart; j < jEnd; j++) {
      const term = row[j] * x[j];
      if (!Number.isFinite(term)) {
        throw new RangeError(
          `${matrixName} substitution produced non-finite intermediate at [${i}][${j}], got ${String(term)}`
        );
      }
      sum -= term;
      if (!Number.isFinite(sum)) {
        throw new RangeError(`${matrixName} substitution accumulator overflowed at row ${i}, got ${String(sum)}`);
      }
    }
    const diagonal = row[i];
    if (Math.abs(diagonal) <= epsilon) {
      return undefined;
    }
    const v = sum / diagonal;
    if (!Number.isFinite(v)) {
      throw new RangeError(
        `${matrixName} substitution produced non-finite solution entry at row ${i}, got ${String(v)}`
      );
    }
    x[i] = v === 0 ? 0 : v;
  }
  return x;
}

/**
 * lower triangular `L`을 transpose하지 않고 `L^T * x = rhs`를 backward substitution으로 푼다.
 *
 * `L^T`는 upper triangular다. 통상의 backward substitution은 `(L^T)[i][j]`를 직접 읽어야 하지만,
 * `(L^T)[i][j] = L[j][i]`이므로 lower 자체에서 column-wise 접근만 하면 동일한 계산을 in-place로
 * 수행할 수 있다. row `i = rows-1..0` 순서로 진행하며 다음을 계산한다.
 *  - `sum = rhs[i] - Σ_{k=i+1..rows-1} L[k][i] * x[k]`
 *  - `x[i] = sum / L[i][i]`
 *
 * caller가 `lower`의 lower triangular 구조 검증(upper 영역 `column > row` abs `<= epsilon` 등)을
 * 이미 수행했다고 가정한다. 이 helper는 비-삼각 영역 cleanup check를 따로 하지 않는다.
 *
 * diagonal abs가 `epsilon` 이하이면 singular로 보고 `undefined`. 누적 합산 또는 division 결과가
 * non-finite면 `RangeError`. 반환 entry에 `-0`은 남기지 않는다(`v === 0`이면 `+0`으로 canonicalize).
 * `rows === 0`이면 `[]`을 반환한다.
 *
 * @param lower 이미 검증된 lower triangular square matrix
 * @param rows substitution 차원
 * @param rhs 길이가 `rows`인 finite RHS vector
 * @param epsilon diagonal zero 판정 tolerance
 * @param matrixName error message에 사용할 matrix 인자 이름
 */
export function performLowerTransposeBackwardSubstitution(
  lower: MatLike,
  rows: number,
  rhs: readonly number[],
  epsilon: number,
  matrixName: string
): number[] | undefined {
  if (rows === 0) {
    return [];
  }

  const x = new Array<number>(rows);
  for (let i = rows - 1; i >= 0; i--) {
    let sum = rhs[i];
    for (let k = i + 1; k < rows; k++) {
      // L^T[i][k] = L[k][i]. transposed matrix를 새로 만들지 않고 column-wise로 읽는다.
      const term = lower[k][i] * x[k];
      if (!Number.isFinite(term)) {
        throw new RangeError(
          `${matrixName} transpose substitution produced non-finite intermediate at [${i}][${k}], got ${String(term)}`
        );
      }
      sum -= term;
      if (!Number.isFinite(sum)) {
        throw new RangeError(
          `${matrixName} transpose substitution accumulator overflowed at row ${i}, got ${String(sum)}`
        );
      }
    }
    const diagonal = lower[i][i];
    if (Math.abs(diagonal) <= epsilon) {
      return undefined;
    }
    const v = sum / diagonal;
    if (!Number.isFinite(v)) {
      throw new RangeError(
        `${matrixName} transpose substitution produced non-finite solution entry at row ${i}, got ${String(v)}`
      );
    }
    x[i] = v === 0 ? 0 : v;
  }
  return x;
}
