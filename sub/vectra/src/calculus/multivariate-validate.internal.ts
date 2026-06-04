import type { MultivariateDerivativeOptions } from './types';

/**
 * `point`가 array인지 검증한다. 위반 시 `TypeError`.
 *
 * point entry의 finite 검증은 별도 helper에서 처리한다. method/step validation을 entry finite
 * 검증보다 앞에 두기 위해 array 확인만 분리한다.
 *
 * @param point 검증할 point 배열 후보
 */
export function assertPointIsArray(point: unknown): void {
  if (!Array.isArray(point)) {
    throw new TypeError(`point must be a readonly number[], got ${typeof point}`);
  }
}

/**
 * `point`의 모든 entry가 finite number인지 검증한다.
 *
 * entry가 non-finite(`NaN`/`Infinity`/`-Infinity`)면 `RangeError`. `point.length === 0`이어도
 * 통과한다.
 *
 * @param point finite 검증을 통과해야 할 point 배열
 */
export function assertPointEntriesFinite(point: readonly number[]): void {
  for (let i = 0; i < point.length; i++) {
    const v = point[i];
    if (!Number.isFinite(v)) {
      throw new RangeError(`point[${i}] must be a finite number, got ${String(v)}`);
    }
  }
}

/**
 * multivariate finite-difference helper의 method literal을 검증한다.
 *
 * `options?.method`가 `"forward"`/`"backward"`/`"central"` 중 하나가 아니면 `RangeError`.
 * 미지정 시 `"central"`을 기본값으로 반환한다.
 * `point.length === 0`이어도 invalid literal은 fail-fast로 처리한다.
 *
 * @param options 검증할 옵션 객체. method 외 필드는 사용하지 않는다.
 */
export function resolveMultivariateMethod(
  options: MultivariateDerivativeOptions | undefined
): 'forward' | 'backward' | 'central' {
  const method = options?.method ?? 'central';
  if (method !== 'forward' && method !== 'backward' && method !== 'central') {
    throw new RangeError(`method must be "forward" | "backward" | "central", got ${String(method)}`);
  }
  return method;
}

/**
 * step option을 length가 `dimension`과 같은 positive finite vector로 normalize한다.
 *
 * `options?.step` 미지정 시 기본값 `1e-5`를 모든 축에 적용한다. scalar number이면 모든 축에 같은
 * step을 적용한다. vector이면 length가 `dimension`과 같아야 하며 다르면 `RangeError`.
 * scalar 값과 vector 각 entry는 positive finite number여야 한다(`0`, 음수, `NaN`, `Infinity`는
 * 모두 `RangeError`).
 *
 * @param options 검증할 옵션 객체. step 외 필드는 사용하지 않는다.
 * @param dimension `point.length`. vector step length 검증과 결과 vector 길이로 사용한다.
 */
export function resolveMultivariateStep(
  options: MultivariateDerivativeOptions | undefined,
  dimension: number
): number[] {
  const raw = options?.step;
  if (raw === undefined) {
    const result = new Array<number>(dimension);
    for (let i = 0; i < dimension; i++) {
      result[i] = 1e-5;
    }
    return result;
  }
  if (typeof raw === 'number') {
    assertPositiveFiniteStep(raw, 'step');
    const result = new Array<number>(dimension);
    for (let i = 0; i < dimension; i++) {
      result[i] = raw;
    }
    return result;
  }
  if (!Array.isArray(raw)) {
    throw new RangeError(
      `step must be a positive finite number or a readonly number[] of length ${dimension}, got ${typeof raw}`
    );
  }
  if (raw.length !== dimension) {
    throw new RangeError(`step vector length must equal point.length=${dimension}, got length=${raw.length}`);
  }
  const result = new Array<number>(dimension);
  for (let i = 0; i < dimension; i++) {
    const entry = raw[i];
    assertPositiveFiniteStep(entry, `step[${i}]`);
    result[i] = entry;
  }
  return result;
}

/**
 * scalar function callback `f`의 evaluation 결과가 finite number인지 확인한다.
 *
 * non-finite면 `RangeError`. error message는 호출 위치를 식별할 수 있도록 `name`을 포함한다.
 *
 * @param value callback 결과값
 * @param name error message에 사용할 evaluation 식별자(`f(x)`, `f(x + h e_i)` 등)
 */
export function assertFiniteCallbackScalar(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must return a finite number, got ${String(value)}`);
  }
}

/**
 * finite-difference arithmetic 결과가 finite number인지 확인한다.
 *
 * subtraction, division 같은 산술 결과가 ±Infinity나 NaN으로 떨어지면 `RangeError`.
 *
 * @param value 산술 결과값
 * @param name error message에 사용할 산술 식별자
 */
export function assertFiniteArithmetic(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite, got ${String(value)}`);
  }
}

function assertPositiveFiniteStep(value: number, name: string): void {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number, got ${String(value)}`);
  }
}

/**
 * 계산이 끝난 finite number matrix를 `out`에 commit한다.
 *
 * 모든 validation과 산술이 끝난 뒤 단 한 번 호출해 `out`의 row 수를 `temp.length`로 맞추고
 * 각 row의 길이도 `temp[r].length`로 맞춘다. `out[r]`가 array가 아니거나 존재하지 않으면 새 row를
 * 만들어 채운다. 결과의 `-0`은 `0`으로 canonicalize한다. `temp`는 `out`과 다른 array 인스턴스이며
 * aliasing 보호는 caller가 fresh storage를 만드는 방식으로 보장한다.
 *
 * `temp.length === 0` 또는 `row.length === 0`인 경우에도 동일 함수로 처리한다.
 *
 * @param out 결과를 commit할 writable matrix
 * @param temp commit할 source matrix. shape는 rectangular `[m, n]` 또는 `[m, 0]`.
 */
export function commitMatrixInto(out: number[][], temp: readonly (readonly number[])[]): void {
  out.length = temp.length;
  for (let r = 0; r < temp.length; r++) {
    const src = temp[r];
    let row = out[r];
    if (!Array.isArray(row)) {
      row = [];
      out[r] = row;
    }
    row.length = src.length;
    for (let c = 0; c < src.length; c++) {
      const v = src[c];
      row[c] = Object.is(v, -0) ? 0 : v;
    }
  }
}
