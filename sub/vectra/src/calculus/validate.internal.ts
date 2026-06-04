/**
 * value가 finite number가 아니면 `RangeError`를 던진다.
 *
 * 모든 calculus public scalar entry는 finite number만 허용한다.
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
 * value가 비음의 safe integer인지 검증한다. 위반 시 `RangeError`.
 *
 * `Number.isSafeInteger` + `value >= 0` 조합으로 count, binCount 등에 사용한다.
 *
 * @param value 검증할 number
 * @param name error message에 사용할 인자 이름
 */
export function assertNonNegativeSafeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer, got ${String(value)}`);
  }
}
