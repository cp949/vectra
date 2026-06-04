import { DEFAULT_PIVOT_EPSILON } from './elimination.internal';
import type { MatLike, QRDecomposition, QROptions } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * `QROptions.epsilon`을 검증하고 미지정 시 default(`DEFAULT_PIVOT_EPSILON`)를 반환한다.
 *
 * `epsilon`이 NaN, Infinity, 음수이면 `RangeError`.
 *
 * @param options QR 옵션. `undefined`이면 default를 사용한다.
 * @param name error message에 사용할 옵션 인자 이름
 */
function resolveQrEpsilon(options: QROptions | undefined, name: string): number {
  const epsilon = options?.epsilon;
  if (epsilon === undefined) {
    return DEFAULT_PIVOT_EPSILON;
  }
  if (!Number.isFinite(epsilon) || epsilon < 0) {
    throw new RangeError(`${name}.epsilon must be a finite number >= 0, got ${String(epsilon)}`);
  }
  return epsilon;
}

/**
 * 두 finite vector의 dot product를 계산한다. 누적 합 overflow는 `RangeError`.
 *
 * @param a 첫 번째 vector
 * @param b 두 번째 vector
 * @param m vector length
 */
function finiteDot(a: readonly number[], b: readonly number[], m: number): number {
  let sum = 0;
  for (let i = 0; i < m; i++) {
    sum += a[i] * b[i];
    if (!Number.isFinite(sum)) {
      throw new RangeError(`QR decomposition produced non-finite intermediate at projection step, got ${String(sum)}`);
    }
  }
  return sum;
}

/**
 * vector의 ℓ2 norm을 max-scaling으로 계산한다. 누적 합 overflow는 `RangeError`.
 *
 * @param v finite vector
 * @param m vector length
 */
function finiteEuclideanNorm(v: readonly number[], m: number): number {
  let max = 0;
  for (let i = 0; i < m; i++) {
    const abs = Math.abs(v[i]);
    if (abs > max) max = abs;
  }
  if (max === 0) return 0;
  // safety net. v[i] 모두 사전 검증된 finite이고 max = max(|v[i]|) 누적이라 finite. 사전 검증 정책이
  // 바뀌면 silent Infinity 대신 RangeError로 막는다.
  if (!Number.isFinite(max)) {
    throw new RangeError(`QR decomposition produced non-finite max during norm, got ${String(max)}`);
  }
  let sum = 0;
  for (let i = 0; i < m; i++) {
    const s = v[i] / max;
    sum += s * s;
    if (!Number.isFinite(sum)) {
      throw new RangeError(`QR decomposition produced non-finite intermediate during norm, got ${String(sum)}`);
    }
  }
  const norm = max * Math.sqrt(sum);
  if (!Number.isFinite(norm)) {
    throw new RangeError(`QR decomposition produced non-finite norm, got ${String(norm)}`);
  }
  return norm;
}

function copyMatrixColumn(matrix: MatLike, column: number, rows: number): number[] {
  const v = new Array<number>(rows);
  for (let i = 0; i < rows; i++) {
    v[i] = matrix[i][column];
  }
  return v;
}

function projectOntoExistingColumns(
  v: number[],
  qCols: readonly (readonly number[])[],
  rows: number,
  column: number
): number[] {
  const rColumn = new Array<number>(qCols.length);
  for (let k = 0; k < qCols.length; k++) {
    const coeff = finiteDot(qCols[k], v, rows);
    rColumn[k] = coeff;
    const qk = qCols[k];
    for (let i = 0; i < rows; i++) {
      const updated = v[i] - coeff * qk[i];
      if (!Number.isFinite(updated)) {
        throw new RangeError(`QR decomposition produced non-finite value at [${i}][${column}], got ${String(updated)}`);
      }
      v[i] = updated;
    }
  }
  return rColumn;
}

function commitProjectionColumn(rRows: number[][], rColumn: readonly number[], column: number): void {
  for (let k = 0; k < rRows.length; k++) {
    const coeff = rColumn[k];
    rRows[k][column] = Object.is(coeff, -0) ? 0 : coeff;
  }
}

function getQrColumnSign(v: readonly number[], rows: number): 1 | -1 {
  // sign convention은 strict-zero 비교를 쓴다(tolerance-split 정책상 zero norm 판정 epsilon과
  // sign 결정의 zero 판정은 서로 다른 의미라 같은 tolerance를 공유하지 않는다).
  for (let i = 0; i < rows; i++) {
    const value = v[i];
    if (value !== 0) {
      return value < 0 ? -1 : 1;
    }
  }
  return 1;
}

function createSignedUnitColumn(
  v: readonly number[],
  rows: number,
  sign: 1 | -1,
  norm: number,
  rank: number
): number[] {
  const newQ = new Array<number>(rows);
  for (let i = 0; i < rows; i++) {
    const value = (sign * v[i]) / norm;
    if (!Number.isFinite(value)) {
      throw new RangeError(`QR decomposition produced non-finite Q entry at [${i}][${rank}], got ${String(value)}`);
    }
    newQ[i] = Object.is(value, -0) ? 0 : value;
  }
  return newQ;
}

function createZeroRow(columns: number): number[] {
  const row = new Array<number>(columns);
  for (let j = 0; j < columns; j++) {
    row[j] = 0;
  }
  return row;
}

function appendIndependentQrColumn(
  v: readonly number[],
  qCols: number[][],
  rRows: number[][],
  rColumn: readonly number[],
  rows: number,
  columns: number,
  column: number,
  norm: number
): void {
  const sign = getQrColumnSign(v, rows);
  const newQ = createSignedUnitColumn(v, rows, sign, norm, qCols.length);
  const newRRow = createZeroRow(columns);

  commitProjectionColumn(rRows, rColumn, column);
  const diagonal = sign * norm;
  newRRow[column] = Object.is(diagonal, -0) ? 0 : diagonal;

  qCols.push(newQ);
  rRows.push(newRRow);
}

function buildOrthogonalMatrix(qCols: readonly (readonly number[])[], rows: number): number[][] {
  const rank = qCols.length;
  const orthogonal: number[][] = new Array(rows);
  for (let i = 0; i < rows; i++) {
    const row = new Array<number>(rank);
    for (let k = 0; k < rank; k++) {
      const value = qCols[k][i];
      row[k] = Object.is(value, -0) ? 0 : value;
    }
    orthogonal[i] = row;
  }
  return orthogonal;
}

/**
 * rectangular matrix `A`(`m x n`)의 thin QR factorization `A = Q * R`을 modified Gram-Schmidt
 * 알고리즘으로 계산해 `QRDecomposition`을 반환한다.
 *
 * 검증 순서: `resolveQrEpsilon` → `extractMatrixShape(matrix)` → `assertFiniteMatrixEntries`.
 * 어느 단계 실패도 결과 미생성이다.
 *
 * 알고리즘 (modified Gram-Schmidt):
 *  1. column 단위로 순회. 각 column `j`마다 `v = A_col[j]`로 초기화.
 *  2. 누적된 orthonormal column `Q_col[k]`(k = 0..r-1)에 대해:
 *     - `R[k][j] = dot(Q_col[k], v)`.
 *     - `v -= R[k][j] * Q_col[k]`.
 *  3. `norm = ||v||₂`. `norm <= epsilon`이면 dependent column으로 보고 rank를 증가시키지 않고
 *     다음 column으로 넘어간다(이전 step에서 계산된 `R[0..r-1][j]` projection coefficient는
 *     보존되고, 새 `R` row는 추가하지 않는다).
 *  4. 그 외에는 `v`의 strict-zero가 아닌 첫 entry가 음수이면 `s = -1`, 양수이면 `s = +1`로
 *     sign을 결정한다(non-zero 판정은 `value !== 0`로 strict 비교한다. tolerance-split 정책
 *     상 `epsilon`은 sign 결정에 쓰이지 않는다). `Q_col[r] = (s * v) / norm`,
 *     `R[r][j] = s * norm`. rank를 1 증가시킨다.
 *
 * sign convention으로 인해 `Q_col[r]`의 strict-zero가 아닌 첫 entry는 항상 양수다. 미래 column이
 * `Q_col[r]` 위로 project될 때 dot product에 `s`가 반영되어 결과의 sign이 자연스럽게 cascade된다.
 *
 * `matrix`는 rectangular nested array여야 한다. ragged matrix와 one-sided zero shape `[[]]`는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 0 이상 finite number여야 한다. 미지정 시 default(`1e-9`). 위반 시
 * `RangeError`. epsilon 검증은 다른 input 검증보다 먼저 수행한다.
 * `epsilon`은 zero norm 판정과 result zero cleanup에만 쓰인다. input/result finite validation
 * 에는 사용하지 않는다.
 *
 * `matrix = []`는 `{ orthogonal: [], upper: [], rank: 0 }`을 반환한다. `rank === 0`인 그 외 case도
 * `orthogonal === []`, `upper === []`이다.
 *
 * 결과의 `orthogonal`(`m x rank`)과 `upper`(`rank x n`)는 input matrix 참조를 공유하지 않는 fresh
 * storage다. 누적 norm/projection/division 결과가 non-finite면 `RangeError`. 결과 entry의 `-0`은
 * `+0`으로 canonicalize한다.
 *
 * 결과는 fixed plain object를 직접 반환한다. `*Into` variant를 제공하지 않는다.
 *
 * @param matrix rectangular numeric matrix
 * @param options QR 옵션. `epsilon` 미지정 시 default(`1e-9`).
 */
export function qrDecomposition(matrix: MatLike, options?: QROptions): QRDecomposition {
  const epsilon = resolveQrEpsilon(options, 'options');
  const shape = extractMatrixShape(matrix, 'matrix');
  const [rows, columns] = shape;
  assertFiniteMatrixEntries(matrix, shape, 'matrix');

  const m = rows;
  const n = columns;
  const qCols: number[][] = [];
  const rRows: number[][] = [];

  for (let j = 0; j < n; j++) {
    const v = copyMatrixColumn(matrix, j, m);
    const rColumn = projectOntoExistingColumns(v, qCols, m, j);

    const norm = finiteEuclideanNorm(v, m);

    if (norm <= epsilon) {
      commitProjectionColumn(rRows, rColumn, j);
      continue;
    }

    appendIndependentQrColumn(v, qCols, rRows, rColumn, m, n, j, norm);
  }

  const rank = qCols.length;
  if (rank === 0) {
    return { orthogonal: [], upper: [], rank: 0 };
  }

  return { orthogonal: buildOrthogonalMatrix(qCols, m), upper: rRows, rank };
}
