/**
 * `values`가 readonly number 배열인지 검증한다. 위반 시 `TypeError`.
 *
 * 모든 statistics public entry는 array input만 허용한다. caller는 entry finite 여부는 별도
 * 검증에서 확인한다.
 *
 * @param values 검증할 값
 * @param name error message에 사용할 인자 이름
 */
export function assertValuesArray(values: unknown, name: string): asserts values is readonly number[] {
  if (!Array.isArray(values)) {
    throw new TypeError(`${name} must be a readonly number array, got ${typeof values}`);
  }
}

/**
 * `mode`가 `"population"` 또는 `"sample"`인지 검증한다. 위반 시 `RangeError`.
 *
 * caller는 `options?.mode ?? "population"`처럼 default를 적용한 뒤 호출한다.
 *
 * @param mode 검증할 mode 값
 * @param name error message에 사용할 인자 이름
 */
export function assertVarianceMode(mode: unknown, name: string): asserts mode is 'population' | 'sample' {
  if (mode !== 'population' && mode !== 'sample') {
    throw new RangeError(`${name} must be "population" | "sample", got ${String(mode)}`);
  }
}

/**
 * `values`의 모든 entry가 finite number임을 검증하고 누적 sum이 finite로 유지됨을 보장한다.
 *
 * 첫 entry부터 순서대로 finite를 확인하고 누적 sum의 finite 여부를 매 step 검증한다. entry가
 * non-finite거나 누적 sum이 non-finite가 되면 `RangeError`. caller는 호출 전 `values`가 array임을
 * 보장한다. 빈 배열에는 `0`을 반환한다.
 *
 * @param values 검증과 누적 대상 number 배열
 * @param name error message에 사용할 인자 이름. 둘 이상의 vector를 함께 검증하는 caller가 `first`,
 *   `second` 같은 이름을 넘겨 진단 메시지를 구분할 수 있다. 기본 `"values"`.
 * @returns finite로 유지된 누적 sum
 */
export function sumFiniteValues(values: readonly number[], name = 'values'): number {
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (!Number.isFinite(value)) {
      throw new RangeError(`${name}[${i}] must be a finite number, got ${String(value)}`);
    }
    sum += value;
    if (!Number.isFinite(sum)) {
      throw new RangeError(`${name} sum must be finite, got ${String(sum)} at index ${i}`);
    }
  }
  return sum;
}
