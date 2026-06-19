/**
 * easing domain validators + 공유 상수.
 *
 * easing leaf의 domain 경계 검증 guard와 공식 표준 상수를 모은다.
 */

/**
 * t가 finite number인지 검증한다.
 *
 * NaN과 +/-Infinity를 domain 경계에서 거르기 위한 공통 guard다.
 */
export function assertFiniteT(t: number): void {
  if (!Number.isFinite(t)) {
    throw new RangeError('easing t must be a finite number');
  }
}

/**
 * exponent가 finite positive number(> 0)인지 검증한다.
 *
 * powerIn/Out/InOut에서 사용한다.
 */
export function assertPositiveFiniteExponent(exponent: number): void {
  if (!Number.isFinite(exponent) || exponent <= 0) {
    throw new RangeError('easing exponent must be a finite positive number (> 0)');
  }
}

/**
 * back easing의 overshoot이 finite number인지 검증한다.
 *
 * non-finite overshoot은 공식 연산 결과를 예측 불가하게 만들므로 거른다.
 * 음수 overshoot은 anticipation 반전을 위해 허용한다.
 */
export function assertFiniteOvershoot(overshoot: number): void {
  if (!Number.isFinite(overshoot)) {
    throw new RangeError('easing overshoot must be a finite number');
  }
}

/**
 * fn이 callable function인지 검증한다.
 *
 * with* composition helper에서 사용한다.
 */
export function assertEasingFunction(fn: unknown): void {
  if (typeof fn !== 'function') {
    throw new RangeError('easing wrapper fn must be a function');
  }
}

/**
 * blend weight가 finite number인지 검증한다.
 *
 * easeBlend는 weight를 clamp하지 않고 extrapolation을 허용하되 non-finite만 거른다.
 */
export function assertFiniteWeight(weight: number): void {
  if (!Number.isFinite(weight)) {
    throw new RangeError('easing blend weight must be a finite number');
  }
}

/**
 * elastic easing의 amplitude가 유효한지 검증한다.
 *
 * amplitude >= 1이어야 하며 finite positive number를 요구한다.
 */
export function assertElasticAmplitude(amplitude: number): void {
  if (!Number.isFinite(amplitude) || amplitude < 1) {
    throw new RangeError('easing elastic amplitude must be a finite number >= 1');
  }
}

/**
 * elastic easing의 period가 유효한지 검증한다.
 *
 * period > 0이어야 하며 finite positive number를 요구한다.
 */
export function assertElasticPeriod(period: number): void {
  if (!Number.isFinite(period) || period <= 0) {
    throw new RangeError('easing elastic period must be a finite positive number (> 0)');
  }
}

// ─── 공유 상수 ────────────────────────────────────────────────────────────────

/** back easing 기본 overshoot 값 (Penner 표준값). */
export const DEFAULT_BACK_OVERSHOOT = 1.70158;

/** bounce 공식 상수 (Penner 표준값). */
export const BOUNCE_N1 = 7.5625;
export const BOUNCE_D1 = 2.75;

/** elastic easing 기본 파라미터. */
export const ELASTIC_DEFAULT_AMPLITUDE = 1;
export const ELASTIC_DEFAULT_PERIOD = 0.3;
