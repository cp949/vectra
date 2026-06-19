/**
 * histogram / digitize / bincount의 integer / edge / range 검증 helper.
 *
 * label/safe integer 검증, explicit bin edge 검증, explicit range 검증을 모은다.
 */

import { assertValuesArray } from './validate.internal';

/**
 * `value`가 non-negative safe integer임을 검증한다. 위반 시 `RangeError`.
 *
 * `number` 타입이지만 non-integer / 음수 / `Infinity` / `NaN` / `Number.MAX_SAFE_INTEGER` 초과는 모두 거부.
 *
 * @param value 검증할 값
 * @param name error message에 사용할 인자 이름
 */
export function assertNonNegativeSafeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer, got ${String(value)}`);
  }
}

/**
 * `value`가 positive safe integer(`>= 1`)임을 검증한다. 위반 시 `RangeError`.
 *
 * @param value 검증할 값
 * @param name error message에 사용할 인자 이름
 */
export function assertPositiveSafeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new RangeError(`${name} must be a positive safe integer, got ${String(value)}`);
  }
}

/**
 * explicit bin edge 배열을 검증한다.
 *
 * top-level 또는 entry가 number 배열이 아니면 `TypeError`. length `< 2`, finite 위반, strictly
 * increasing 위반은 모두 `RangeError`.
 *
 * @param edges 검증할 bin edge 배열
 * @param name error message에 사용할 인자 이름
 */
export function assertExplicitBinEdges(edges: unknown, name: string): asserts edges is readonly number[] {
  assertValuesArray(edges, name);
  const arr = edges as readonly number[];
  if (arr.length < 2) {
    throw new RangeError(`${name} must have length >= 2, got ${arr.length}`);
  }
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (typeof v !== 'number') {
      throw new TypeError(`${name}[${i}] must be a number, got ${typeof v}`);
    }
    if (!Number.isFinite(v)) {
      throw new RangeError(`${name}[${i}] must be a finite number, got ${String(v)}`);
    }
  }
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] <= arr[i - 1]) {
      throw new RangeError(
        `${name} must be strictly increasing: ${name}[${i - 1}] (${arr[i - 1]}) >= ${name}[${i}] (${arr[i]})`
      );
    }
  }
}

/**
 * `range` 옵션이 `[min, max]` finite tuple이고 `min < max`인지 검증한다.
 *
 * top-level이 array가 아니면 `TypeError`. length !== 2, entry non-number, non-finite, `min >= max`는 `RangeError`.
 *
 * @param range 검증할 range 옵션
 * @param name error message에 사용할 인자 이름
 */
export function assertExplicitRange(range: unknown, name: string): asserts range is readonly [number, number] {
  if (!Array.isArray(range)) {
    throw new TypeError(`${name} must be a readonly [number, number], got ${typeof range}`);
  }
  if (range.length !== 2) {
    throw new RangeError(`${name} must have length 2, got ${range.length}`);
  }
  const [min, max] = range as readonly unknown[];
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError(`${name} entries must be number, got [${typeof min}, ${typeof max}]`);
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new RangeError(`${name} entries must be finite, got [${String(min)}, ${String(max)}]`);
  }
  if (min >= max) {
    throw new RangeError(`${name} must satisfy min < max, got [${min}, ${max}]`);
  }
}
