import { assertValuesArray } from './validate.internal';

/**
 * `values`가 비어 있지 않은 finite number 배열인지 검증한 뒤 ascending sorted copy를 반환한다.
 *
 * `values`가 array가 아니면 `TypeError`. 빈 배열이면 `RangeError`. entry가 finite가 아니면
 * `RangeError`. caller input은 mutate하지 않는다. 정렬은 `(a, b) => a - b`로 수행한다.
 *
 * @param values sorted copy를 만들 number 배열
 * @param name error message에 사용할 인자 이름. 기본 `"values"`.
 */
export function sortedFiniteCopy(values: readonly number[], name = 'values'): number[] {
  assertValuesArray(values, name);
  const length = values.length;
  if (length === 0) {
    throw new RangeError(`${name} must not be empty`);
  }
  const sorted = new Array<number>(length);
  for (let i = 0; i < length; i++) {
    const value = values[i];
    if (!Number.isFinite(value)) {
      throw new RangeError(`${name}[${i}] must be a finite number, got ${String(value)}`);
    }
    sorted[i] = value;
  }
  sorted.sort((a, b) => a - b);
  return sorted;
}

/**
 * ascending sorted finite number 배열의 median(type 7 linear interpolation)을 반환한다.
 *
 * `sorted.length === 1`이면 단일 entry를 그대로 반환한다. 짝수 length는 가운데 두 entry의
 * 산술 평균이고, 홀수 length는 가운데 entry다. caller는 `sorted`가 ascending sorted finite
 * number 배열이며 `sorted.length >= 1`임을 보장한다. `-0` canonicalize는 caller가 수행한다.
 *
 * @param sorted ascending sorted finite number 배열. length >= 1.
 */
export function medianOfSorted(sorted: readonly number[]): number {
  const n = sorted.length;
  if (n === 1) {
    return sorted[0];
  }
  const mid = (n - 1) / 2;
  const lo = Math.floor(mid);
  const hi = Math.ceil(mid);
  if (lo === hi) {
    return sorted[lo];
  }
  return sorted[lo] + 0.5 * (sorted[hi] - sorted[lo]);
}

/**
 * ascending sorted finite number 배열에서 `q` 분위수를 type 7 linear interpolation으로 반환한다.
 *
 * `pos = q * (n - 1)`, `lo = floor(pos)`, `hi = ceil(pos)`, `fraction = pos - lo`,
 * `result = sorted[lo] + fraction * (sorted[hi] - sorted[lo])`. `q === 0`은 sorted[0],
 * `q === 1`은 sorted[n-1]. `sorted.length === 1`이면 단일 entry를 그대로 반환한다.
 *
 * caller는 `sorted`가 ascending sorted finite number 배열이고 `sorted.length >= 1`이며
 * `q ∈ [0, 1]` finite임을 보장한다. 결과의 finite 검증과 `-0` canonicalize는 caller가 수행한다.
 *
 * @param sorted ascending sorted finite number 배열. length >= 1.
 * @param q `[0, 1]` 범위의 finite 분위수 위치.
 */
export function quantileOfSorted(sorted: readonly number[], q: number): number {
  const length = sorted.length;
  if (length === 1) {
    return sorted[0];
  }
  const pos = q * (length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) {
    return sorted[lo];
  }
  const fraction = pos - lo;
  return sorted[lo] + fraction * (sorted[hi] - sorted[lo]);
}

/**
 * scalar 결과의 `-0`을 `0`으로 canonicalize한다.
 *
 * `Object.is(value, -0)` 기준으로 판별한다. 다른 finite 값은 그대로 반환한다.
 *
 * @param value canonicalize할 scalar
 */
export function canonicalizeNegativeZero(value: number): number {
  return Object.is(value, -0) ? 0 : value;
}
