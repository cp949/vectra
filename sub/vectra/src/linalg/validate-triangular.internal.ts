import type { MatLike } from './types';

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
