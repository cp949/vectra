import { eliminateRows } from './elimination.internal';
import type { MatLike } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

/**
 * matrix가 finite square nested array인지 검증하고 한 변 길이 `n`을 반환한다.
 *
 * 빈 matrix `[]`는 `n = 0`을 반환한다. `rows !== columns`이면 `RangeError`.
 * ragged matrix 또는 non-finite entry도 `RangeError`.
 *
 * @param matrix 검증할 matrix
 * @param name error message에 사용할 인자 이름
 */
export function validateFiniteSquareMatrix(matrix: MatLike, name: string): number {
  const shape = extractMatrixShape(matrix, name);
  assertFiniteMatrixEntries(matrix, shape, name);
  const [rows, columns] = shape;
  if (rows !== columns) {
    throw new RangeError(`${name} must be a square matrix, got shape [${rows}, ${columns}]`);
  }
  return rows;
}

/**
 * `n x n` matrix를 row 참조를 공유하지 않는 새 `number[][]`로 deep copy한다.
 *
 * caller가 `validateFiniteSquareMatrix`로 얻은 `n`을 그대로 전달한다.
 *
 * @param matrix 복사할 source matrix
 * @param n 한 변 길이
 */
export function copySquareMatrix(matrix: MatLike, n: number): number[][] {
  const out: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const src = matrix[r];
    const row = new Array<number>(n);
    for (let c = 0; c < n; c++) {
      row[c] = src[c];
    }
    out[r] = row;
  }
  return out;
}

/**
 * `n x n` identity matrix를 새 `number[][]`로 만든다.
 *
 * `n === 0`이면 `[]`을 반환한다.
 *
 * @param n 한 변 길이. 비음의 safe integer.
 */
export function makeIdentitySquareMatrix(n: number): number[][] {
  const out: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const row = new Array<number>(n);
    for (let c = 0; c < n; c++) {
      row[c] = r === c ? 1 : 0;
    }
    out[r] = row;
  }
  return out;
}

/**
 * 두 `n x n` matrix의 곱 `out[i][j] = sum_k a[i][k] * b[k][j]`를 새 `number[][]`로 반환한다.
 *
 * caller가 양쪽 matrix를 `validateFiniteSquareMatrix`로 검증한 뒤 호출한다.
 * 모든 출력 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `n === 0`이면 `[]`을 반환한다.
 *
 * @param a 좌측 matrix
 * @param b 우측 matrix
 * @param n 한 변 길이
 */
export function multiplyFiniteSquareMatrices(
  a: readonly (readonly number[])[],
  b: readonly (readonly number[])[],
  n: number
): number[][] {
  if (n === 0) {
    return [];
  }
  const out: number[][] = new Array(n);
  for (let i = 0; i < n; i++) {
    const rowA = a[i];
    const row = new Array<number>(n);
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += rowA[k] * b[k][j];
      }
      if (!Number.isFinite(sum)) {
        throw new RangeError(`matrix product entry at [${i}][${j}] must be a finite number, got ${String(sum)}`);
      }
      row[j] = sum;
    }
    out[i] = row;
  }
  return out;
}

/**
 * `n x n` finite square matrix의 inverse를 새 `number[][]`로 반환하거나 singular이면 `undefined`.
 *
 * `[A | I]` augmented matrix에 partial pivoting Gauss-Jordan elimination을 적용해 right half를
 * inverse로 추출한다. `epsilon`은 partial pivoting zero pivot 판정과 elimination zero cleanup에만
 * 쓰인다.
 *
 * caller가 `validateFiniteSquareMatrix`로 finite square matrix를 보장한다. `n === 0`이면 `[]`을
 * 반환한다. elimination 도중 결과 entry가 non-finite면 `RangeError`. 결과 entry의 `-0`은
 * `+0`으로 canonicalize한다.
 *
 * @param matrix inverse를 계산할 finite square matrix
 * @param n 한 변 길이
 * @param epsilon pivot zero 판정과 elimination zero cleanup tolerance
 */
export function invertFiniteSquareMatrix(matrix: MatLike, n: number, epsilon: number): number[][] | undefined {
  if (n === 0) {
    return [];
  }
  const augmentedColumns = 2 * n;
  const temp: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const row = new Array<number>(augmentedColumns);
    const src = matrix[r];
    for (let c = 0; c < n; c++) {
      row[c] = src[c];
      row[n + c] = r === c ? 1 : 0;
    }
    temp[r] = row;
  }
  eliminateRows(temp, n, augmentedColumns, epsilon, true);
  for (let i = 0; i < n; i++) {
    if (temp[i][i] !== 1) {
      return undefined;
    }
  }
  const inv: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const row = new Array<number>(n);
    const src = temp[r];
    for (let c = 0; c < n; c++) {
      const v = src[n + c];
      row[c] = v === 0 ? 0 : v;
    }
    inv[r] = row;
  }
  return inv;
}

/**
 * `n x n` finite square matrix의 infinity norm `max_r Σ_c |matrix[r][c]|`을 반환한다.
 *
 * caller가 `validateFiniteSquareMatrix`로 finite square matrix를 보장한다. 누적 절대값 합이
 * Infinity로 overflow되면 `RangeError`.
 * `n === 0`이면 `0`을 반환한다.
 *
 * @param matrix infinity norm을 계산할 n×n matrix
 * @param n 한 변 길이
 */
export function infinityNormFiniteSquareMatrix(matrix: readonly (readonly number[])[], n: number): number {
  let max = 0;
  for (let r = 0; r < n; r++) {
    const row = matrix[r];
    let sum = 0;
    for (let c = 0; c < n; c++) {
      sum += Math.abs(row[c]);
      if (!Number.isFinite(sum)) {
        throw new RangeError(`matrix infinity norm overflow at row ${r}, column ${c}`);
      }
    }
    if (sum > max) {
      max = sum;
    }
  }
  return max;
}

/**
 * `n x n` matrix의 모든 entry에 대해 `-0`을 `+0`으로 canonicalize한다.
 *
 * `Object.is(value, -0)` 위치만 `0`으로 덮어쓴다. 다른 entry는 그대로 둔다.
 *
 * @param matrix in-place로 canonicalize할 matrix
 * @param n 한 변 길이
 */
export function canonicalizeNegativeZeroSquareMatrix(matrix: number[][], n: number): void {
  for (let r = 0; r < n; r++) {
    const row = matrix[r];
    for (let c = 0; c < n; c++) {
      if (Object.is(row[c], -0)) {
        row[c] = 0;
      }
    }
  }
}
