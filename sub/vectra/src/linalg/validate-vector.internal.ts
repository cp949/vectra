import type { VecLike } from './types';

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
