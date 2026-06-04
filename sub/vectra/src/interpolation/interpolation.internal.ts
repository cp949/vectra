/**
 * interpolation domain 공유 internal helper.
 *
 * public leaf module끼리 domain barrel을 import하지 않으므로
 * 공유 계산과 validation guard를 여기에 모은다.
 */

/**
 * values가 모두 finite number인지 검증한다.
 *
 * NaN과 +/-Infinity를 domain 경계에서 거르기 위한 공통 guard다.
 */
export function assertFiniteNumbers(values: readonly number[]): void {
  for (const value of values) {
    if (!Number.isFinite(value)) {
      throw new RangeError('interpolation arguments must be finite numbers');
    }
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
