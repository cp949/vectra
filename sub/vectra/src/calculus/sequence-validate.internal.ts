/**
 * `values`가 array인지 검증한다. 위반 시 `TypeError`.
 *
 * entry finite 검증, length 검증은 별도 단계에서 처리한다. cumulative trapezoid/diff/cumulative sum의
 * 초기 input shape 검증을 위한 가벼운 helper다.
 *
 * @param values 검증할 sequence 후보
 * @param name error message에 사용할 인자 이름
 */
export function assertValuesIsArray(values: unknown, name: string): void {
  if (!Array.isArray(values)) {
    throw new TypeError(`${name} must be a readonly number[], got ${typeof values}`);
  }
}

/**
 * `values`의 모든 entry가 finite number인지 검증한다.
 *
 * entry가 non-finite(`NaN`/`Infinity`/`-Infinity`)면 `RangeError`. `values.length === 0`이어도
 * 통과한다.
 *
 * @param values finite 검증을 통과해야 할 sequence
 * @param name error message에 사용할 인자 이름
 */
export function assertValuesEntriesFinite(values: readonly number[], name: string): void {
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (!Number.isFinite(v)) {
      throw new RangeError(`${name}[${i}] must be a finite number, got ${String(v)}`);
    }
  }
}

/**
 * `spacing`이 positive finite number인지 검증한다. 위반 시 `RangeError`.
 *
 * `0`, 음수, `NaN`, `Infinity`는 모두 위반이다. caller가 spacing을 생략한 경우는 호출 전에 default로
 * 채워서 전달한다.
 *
 * @param spacing 검증할 spacing 값
 * @param name error message에 사용할 인자 이름
 */
export function assertPositiveFiniteSpacing(spacing: number, name: string): void {
  if (typeof spacing !== 'number' || !Number.isFinite(spacing) || spacing <= 0) {
    throw new RangeError(`${name} must be a positive finite number, got ${String(spacing)}`);
  }
}
