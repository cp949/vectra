import type { MatLike, MatrixShape, VecLike } from './types';

/**
 * value가 finite number가 아니면 `RangeError`를 던진다.
 *
 * 모든 linalg public numeric entry는 finite number만 허용한다.
 *
 * @param value 검증할 number
 * @param name error message에 사용할 인자 이름
 */
export function assertFiniteNumber(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number, got ${String(value)}`);
  }
}

/**
 * vector의 모든 entry가 finite number인지 검증한다. 위반 시 `RangeError`.
 *
 * @param vector 검증할 vector
 * @param name error message에 사용할 인자 이름
 */
export function assertFiniteVector(vector: VecLike, name: string): void {
  for (let i = 0; i < vector.length; i++) {
    const value = vector[i];
    if (!Number.isFinite(value)) {
      throw new RangeError(`${name}[${i}] must be a finite number, got ${String(value)}`);
    }
  }
}

/**
 * 두 vector의 length가 같지 않으면 `RangeError`를 던진다.
 *
 * @param a 첫 번째 vector
 * @param b 두 번째 vector
 * @param aName a의 인자 이름
 * @param bName b의 인자 이름
 */
export function assertSameVectorLength(a: VecLike, b: VecLike, aName: string, bName: string): void {
  if (a.length !== b.length) {
    throw new RangeError(`${aName}.length (${a.length}) must equal ${bName}.length (${b.length})`);
  }
}

/**
 * vector length가 `expected`와 다르면 `RangeError`를 던진다.
 *
 * @param vector 검증할 vector
 * @param expected 기대 length
 * @param name error message에 사용할 인자 이름
 */
export function assertVectorLength(vector: VecLike, expected: number, name: string): void {
  if (vector.length !== expected) {
    throw new RangeError(`${name}.length must be ${expected}, got ${vector.length}`);
  }
}

/**
 * `pNorm`의 `p` 인자가 `p >= 1` finite number인지 검증한다.
 *
 * `p`가 NaN, Infinity, `< 1`이면 `RangeError`.
 *
 * @param p 검증할 p 값
 */
export function assertValidPNorm(p: number): void {
  if (!Number.isFinite(p) || p < 1) {
    throw new RangeError(`p-norm degree must be a finite number >= 1, got ${String(p)}`);
  }
}

/**
 * `SparseOptions.epsilon`이 `0` 이상 finite number인지 검증한다.
 *
 * `epsilon`이 NaN, Infinity, 음수이면 `RangeError`.
 *
 * @param epsilon 검증할 epsilon
 */
export function assertSparseEpsilon(epsilon: number): void {
  if (!Number.isFinite(epsilon) || epsilon < 0) {
    throw new RangeError(`SparseOptions.epsilon must be a finite number >= 0, got ${String(epsilon)}`);
  }
}

/**
 * value가 비음의 safe integer인지 검증한다. 위반 시 `RangeError`.
 *
 * `Number.isSafeInteger` + `value >= 0` 조합으로 sparse index, dimension, shape 등에 사용한다.
 *
 * @param value 검증할 number
 * @param name error message에 사용할 인자 이름
 */
export function assertNonNegativeSafeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer, got ${String(value)}`);
  }
}

/**
 * row/column index가 `0 <= index < bound`인 정수인지 검증한다. 위반 시 `RangeError`.
 *
 * `Number.isInteger`로 NaN, Infinity, 비정수 float를 차단한 뒤 `0 <= index < bound`를 확인한다.
 * `bound`는 caller가 미리 비음의 safe integer로 확보한다.
 *
 * @param index 검증할 index
 * @param bound exclusive upper bound. 보통 row/column 개수.
 * @param name error message에 사용할 인자 이름
 */
export function assertRowIndex(index: number, bound: number, name: string): void {
  if (!Number.isInteger(index) || index < 0 || index >= bound) {
    throw new RangeError(`${name} must be an integer in [0, ${bound}), got ${String(index)}`);
  }
}

/**
 * `MatrixShape` tuple이 비음의 safe integer 쌍이고 one-sided zero shape이 아닌지 검증한다.
 *
 * `[m, 0]` 또는 `[0, n]`(`m > 0` 또는 `n > 0`)는 nested array로 표현할 수 없어 `RangeError`.
 * `[0, 0]`은 허용한다.
 *
 * @param shape 검증할 shape
 * @param name error message에 사용할 인자 이름
 */
export function assertMatrixShape(shape: MatrixShape, name: string): void {
  const [rows, columns] = shape;
  assertNonNegativeSafeInteger(rows, `${name}[0]`);
  assertNonNegativeSafeInteger(columns, `${name}[1]`);
  if ((rows === 0) !== (columns === 0)) {
    throw new RangeError(`${name} one-sided zero shape [${rows}, ${columns}] is not supported`);
  }
}

/**
 * matrix가 rectangular nested array인지 검증하고 `[rows, columns]` shape를 반환한다.
 *
 * 빈 matrix `[]`는 `[0, 0]`로 취급한다. `[[]]`처럼 one-sided zero shape는 `RangeError`.
 * row가 array가 아니거나 길이가 첫 row와 다르면 `RangeError`.
 *
 * @param matrix 검증할 matrix
 * @param name error message에 사용할 인자 이름
 */
export function extractMatrixShape(matrix: MatLike, name: string): MatrixShape {
  const rows = matrix.length;
  if (rows === 0) {
    return [0, 0];
  }
  const firstRow = matrix[0];
  if (!Array.isArray(firstRow)) {
    throw new RangeError(`${name}[0] must be an array`);
  }
  const columns = firstRow.length;
  if (columns === 0) {
    throw new RangeError(`${name} one-sided zero shape [${rows}, 0] is not supported`);
  }
  for (let r = 1; r < rows; r++) {
    const row = matrix[r];
    if (!Array.isArray(row)) {
      throw new RangeError(`${name}[${r}] must be an array`);
    }
    if (row.length !== columns) {
      throw new RangeError(`${name} is not rectangular: row ${r} has length ${row.length}, expected ${columns}`);
    }
  }
  return [rows, columns];
}

/**
 * 두 matrix의 shape가 일치하지 않으면 `RangeError`를 던진다.
 *
 * caller가 이미 `extractMatrixShape`로 양쪽 shape를 확보한 뒤 호출한다.
 *
 * @param aShape 첫 번째 matrix shape
 * @param bShape 두 번째 matrix shape
 * @param aName 첫 번째 matrix 인자 이름
 * @param bName 두 번째 matrix 인자 이름
 */
export function assertSameMatrixShape(aShape: MatrixShape, bShape: MatrixShape, aName: string, bName: string): void {
  if (aShape[0] !== bShape[0] || aShape[1] !== bShape[1]) {
    throw new RangeError(
      `${aName} shape [${aShape[0]}, ${aShape[1]}] does not match ${bName} shape [${bShape[0]}, ${bShape[1]}]`
    );
  }
}

/**
 * matrix의 모든 entry가 finite number인지 검증한다. 위반 시 `RangeError`.
 *
 * caller가 `extractMatrixShape`로 얻은 shape를 함께 전달해 중복 length 탐색을 피한다.
 *
 * @param matrix 검증할 matrix
 * @param shape 이미 검증된 matrix shape
 * @param name error message에 사용할 인자 이름
 */
export function assertFiniteMatrixEntries(matrix: MatLike, shape: MatrixShape, name: string): void {
  const [rows, columns] = shape;
  for (let r = 0; r < rows; r++) {
    const row = matrix[r];
    for (let c = 0; c < columns; c++) {
      const value = row[c];
      if (!Number.isFinite(value)) {
        throw new RangeError(`${name}[${r}][${c}] must be a finite number, got ${String(value)}`);
      }
    }
  }
}

/**
 * matrix가 `n x n` square인지 검증한다. shape 추출도 함께 수행해 `[n, n]`을 반환한다.
 *
 * 내부 `extractMatrixShape`로 rectangular 검증을 거친 뒤 `rows !== columns`이면 `RangeError`.
 *
 * @param matrix 검증할 matrix
 * @param name error message에 사용할 인자 이름
 */
export function assertSquareMatrix(matrix: MatLike, name: string): number {
  const [rows, columns] = extractMatrixShape(matrix, name);
  if (rows !== columns) {
    throw new RangeError(`${name} must be a square matrix, got shape [${rows}, ${columns}]`);
  }
  return rows;
}

/**
 * matrix가 unit lower triangular인지 검증한다.
 *
 * 다음을 모두 만족해야 한다.
 *  - diagonal `matrix[i][i]`가 정확히 `1`이어야 한다.
 *  - upper 영역(`column > row`)의 abs가 `epsilon` 이하여야 한다.
 *
 * 위반은 caller precondition 위반이므로 `RangeError`. caller는 finite, square 검증을 미리
 * 끝낸 뒤 호출한다.
 *
 * @param matrix 검증할 square matrix
 * @param rows 한 변 길이
 * @param epsilon upper 영역 zero 판정 tolerance
 * @param name error message에 사용할 인자 이름
 */
export function assertUnitLowerTriangular(matrix: MatLike, rows: number, epsilon: number, name: string): void {
  for (let r = 0; r < rows; r++) {
    const row = matrix[r];
    if (row[r] !== 1) {
      throw new RangeError(`${name} must have unit diagonal, got ${name}[${r}][${r}] = ${String(row[r])}`);
    }
    for (let c = r + 1; c < rows; c++) {
      const v = row[c];
      if (Math.abs(v) > epsilon) {
        throw new RangeError(
          `${name} must be lower triangular, got ${name}[${r}][${c}] = ${String(v)} exceeds epsilon`
        );
      }
    }
  }
}

/**
 * matrix가 upper triangular인지 검증한다.
 *
 * lower 영역(`column < row`)의 abs가 `epsilon` 이하여야 한다. 위반은 `RangeError`. caller는
 * finite, square 검증을 미리 끝낸 뒤 호출한다.
 *
 * @param matrix 검증할 square matrix
 * @param rows 한 변 길이
 * @param epsilon lower 영역 zero 판정 tolerance
 * @param name error message에 사용할 인자 이름
 */
export function assertUpperTriangular(matrix: MatLike, rows: number, epsilon: number, name: string): void {
  for (let r = 0; r < rows; r++) {
    const row = matrix[r];
    for (let c = 0; c < r; c++) {
      const v = row[c];
      if (Math.abs(v) > epsilon) {
        throw new RangeError(
          `${name} must be upper triangular, got ${name}[${r}][${c}] = ${String(v)} exceeds epsilon`
        );
      }
    }
  }
}

/**
 * matrix가 lower triangular인지 검증한다.
 *
 * upper 영역(`column > row`)의 abs가 `epsilon` 이하여야 한다. 위반은 `RangeError`. caller는
 * finite, square 검증을 미리 끝낸 뒤 호출한다.
 *
 * @param matrix 검증할 square matrix
 * @param rows 한 변 길이
 * @param epsilon upper 영역 zero 판정 tolerance
 * @param name error message에 사용할 인자 이름
 */
export function assertLowerTriangular(matrix: MatLike, rows: number, epsilon: number, name: string): void {
  for (let r = 0; r < rows; r++) {
    const row = matrix[r];
    for (let c = r + 1; c < rows; c++) {
      const v = row[c];
      if (Math.abs(v) > epsilon) {
        throw new RangeError(
          `${name} must be lower triangular, got ${name}[${r}][${c}] = ${String(v)} exceeds epsilon`
        );
      }
    }
  }
}

/**
 * `permutation` 인자가 `[0, length)` 범위 정수의 정확한 순열인지 검증한다.
 *
 * 위반 시 `RangeError`. 다음 조건을 모두 검사한다.
 *  - `Array.isArray(permutation)`
 *  - `permutation.length === length`
 *  - 각 element가 `Number.isInteger`이고 `0 <= idx < length`
 *  - duplicate 없음
 *
 * @param permutation 검증할 permutation array
 * @param length 기대 length(보통 matrix row 수)
 * @param name error message에 사용할 인자 이름
 */
export function assertPermutation(permutation: unknown, length: number, name: string): void {
  if (!Array.isArray(permutation)) {
    throw new RangeError(`${name} must be an array, got ${String(permutation)}`);
  }
  if (permutation.length !== length) {
    throw new RangeError(`${name}.length must be ${length}, got ${permutation.length}`);
  }
  const seen = new Array<boolean>(length);
  for (let i = 0; i < length; i++) {
    seen[i] = false;
  }
  for (let i = 0; i < length; i++) {
    const idx = permutation[i];
    if (!Number.isInteger(idx) || idx < 0 || idx >= length) {
      throw new RangeError(`${name}[${i}] must be an integer in [0, ${length}), got ${String(idx)}`);
    }
    if (seen[idx]) {
      throw new RangeError(`${name} must be a permutation of [0, ${length}), but ${idx} appears more than once`);
    }
    seen[idx] = true;
  }
}
