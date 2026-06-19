import type { MatLike, MatrixShape } from './types';
import { assertNonNegativeSafeInteger } from './validate-vector.internal';

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
