/**
 * interpolation domain 공유 internal helper.
 *
 * public leaf module끼리 domain barrel을 import하지 않으므로
 * 공유 계산과 validation guard를 여기에 모은다.
 */

const FINITE_NUMBERS_MESSAGE = 'interpolation arguments must be finite numbers';

/**
 * values가 모두 finite number인지 검증한다.
 *
 * NaN과 +/-Infinity를 domain 경계에서 거르기 위한 공통 guard다.
 */
export function assertFiniteNumbers(values: readonly number[]): void {
  for (const value of values) {
    if (!Number.isFinite(value)) {
      throw new RangeError(FINITE_NUMBERS_MESSAGE);
    }
  }
}

/**
 * 인자 1개가 finite number인지 검증한다.
 *
 * `assertFiniteNumbers`와 같은 검사를 임시 배열 할당 없이 수행한다.
 */
export function assertFinite1(a: number): void {
  if (!Number.isFinite(a)) {
    throw new RangeError(FINITE_NUMBERS_MESSAGE);
  }
}

/**
 * 인자 2개가 모두 finite number인지 검증한다.
 *
 * `assertFiniteNumbers`와 같은 검사를 임시 배열 할당 없이 수행한다.
 */
export function assertFinite2(a: number, b: number): void {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new RangeError(FINITE_NUMBERS_MESSAGE);
  }
}

/**
 * 인자 3개가 모두 finite number인지 검증한다.
 *
 * `assertFiniteNumbers`와 같은 검사를 임시 배열 할당 없이 수행한다.
 */
export function assertFinite3(a: number, b: number, c: number): void {
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) {
    throw new RangeError(FINITE_NUMBERS_MESSAGE);
  }
}

/**
 * 인자 4개가 모두 finite number인지 검증한다.
 *
 * `assertFiniteNumbers`와 같은 검사를 임시 배열 할당 없이 수행한다.
 */
export function assertFinite4(a: number, b: number, c: number, d: number): void {
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || !Number.isFinite(d)) {
    throw new RangeError(FINITE_NUMBERS_MESSAGE);
  }
}

/**
 * 인자 5개가 모두 finite number인지 검증한다.
 *
 * `assertFiniteNumbers`와 같은 검사를 임시 배열 할당 없이 수행한다.
 */
export function assertFinite5(a: number, b: number, c: number, d: number, e: number): void {
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || !Number.isFinite(d) || !Number.isFinite(e)) {
    throw new RangeError(FINITE_NUMBERS_MESSAGE);
  }
}

/**
 * 비율 계산이 가능한 ordered source range인지 검증한다.
 *
 * `min < max`를 요구하므로 뒤집힌 range와 0-length range를 모두 거부한다.
 */
export function assertNonZeroOrderedRange(min: number, max: number): void {
  if (min > max) {
    throw new RangeError('range min must be less than max');
  }

  if (min === max) {
    throw new RangeError('range must have non-zero length');
  }
}

/**
 * elapsed-time 보간에 쓰는 duration이 유효한지 검증한다.
 *
 * `elapsed / duration` 비율이 정의되려면 duration이 finite이고 `duration > 0`이어야 한다.
 * `duration <= 0`, NaN, +/-Infinity를 모두 거부한다.
 */
export function assertPositiveDuration(duration: number): void {
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new RangeError('interpolation duration must be a finite number greater than 0');
  }
}

/**
 * value를 closed range [min, max]로 제한한다.
 *
 * 호출 전에 min <= max임을 호출자가 보장해야 한다.
 */
export function clampScalar(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * a와 b 사이의 선형 보간값을 반환한다.
 *
 * validation 없이 계산만 수행한다. 호출 전 finite 검증을 호출자가 보장해야 한다.
 */
export function lerpRaw(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * ordered source range [a, b]에서 value가 차지하는 비율을 반환한다.
 *
 * validation 없이 계산만 수행한다. 호출 전 finite 검증과 range 검증을 호출자가 보장해야 한다.
 */
export function inverseLerpRaw(a: number, b: number, value: number): number {
  return (value - a) / (b - a);
}

/**
 * 균등 간격 sample 표에서 `t` 위치의 값을 계산한다.
 *
 * `sampleTableAt`과 `createTableSampler`가 공유한다. validation 없이 계산만 수행한다.
 * 호출자가 `table.length >= 1`, 모든 원소 finite, `t` finite, 유효한 `interpolation`을 보장해야 한다.
 *
 * @param table 균등 parameter interval의 scalar sample 배열
 * @param t 보간 위치. `[0, 1]`이 표 전체 범위다.
 * @param interpolation 보간 방법
 * @param extrapolate `true`이면 `[0, 1]` 밖을 경계 segment slope로 선형 외삽한다.
 */
export function lookupTable(
  table: ArrayLike<number>,
  t: number,
  interpolation: 'linear' | 'nearest',
  extrapolate: boolean
): number {
  const n = table.length;

  if (n === 1) {
    return table[0];
  }

  // out-of-range 외삽은 interpolation mode와 무관하게 boundary segment slope를 사용한다.
  if (extrapolate) {
    if (t < 0) {
      const position = t * (n - 1);
      return lerpRaw(table[0], table[1], position);
    }
    if (t > 1) {
      const position = t * (n - 1);
      const localT = position - (n - 2);
      return lerpRaw(table[n - 2], table[n - 1], localT);
    }
  }

  // clamp t to [0, 1]
  const clampedT = Math.min(1, Math.max(0, t));

  const position = clampedT * (n - 1);

  if (interpolation === 'nearest') {
    const idx = Math.max(0, Math.min(n - 1, Math.round(position)));
    return table[idx];
  }

  const lower = Math.floor(position);
  const upper = Math.ceil(position);

  if (lower === upper) {
    return table[lower];
  }

  const localT = position - lower;
  return lerpRaw(table[lower], table[upper], localT);
}
