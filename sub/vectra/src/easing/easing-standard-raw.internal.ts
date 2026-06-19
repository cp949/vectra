/**
 * easing standard raw 계산식.
 *
 * sine / expo / circ / power / bounce 계열의 validation 없는 raw 수식을 모은다.
 */

import { BOUNCE_D1, BOUNCE_N1 } from './easing-validators.internal';

/**
 * t ** exponent 방식의 ease-in 계산을 수행한다.
 *
 * validation 없이 계산만 수행한다. 호출 전 finite 검증을 호출자가 보장해야 한다.
 */
export function powerInRaw(t: number, exponent: number): number {
  return t ** exponent;
}

/**
 * 1 - (1 - t) ** exponent 방식의 ease-out 계산을 수행한다.
 *
 * validation 없이 계산만 수행한다. 호출 전 finite 검증을 호출자가 보장해야 한다.
 */
export function powerOutRaw(t: number, exponent: number): number {
  return 1 - (1 - t) ** exponent;
}

/**
 * ease-in-out 계산을 수행한다.
 *
 * t < 0.5이면 (2 * t) ** exponent / 2, t >= 0.5이면 1 - (2 - 2 * t) ** exponent / 2.
 * validation 없이 계산만 수행한다. 호출 전 finite 검증을 호출자가 보장해야 한다.
 */
export function powerInOutRaw(t: number, exponent: number): number {
  if (t < 0.5) {
    return (2 * t) ** exponent / 2;
  }
  return 1 - (2 - 2 * t) ** exponent / 2;
}

// ─── sine raw ─────────────────────────────────────────────────────────────────

/** 1 - cos(t*PI/2). validation 없이 계산만 수행한다. */
export function sineInRaw(t: number): number {
  return 1 - Math.cos((t * Math.PI) / 2);
}

/** sin(t*PI/2). validation 없이 계산만 수행한다. */
export function sineOutRaw(t: number): number {
  return Math.sin((t * Math.PI) / 2);
}

/** -(cos(PI*t) - 1) / 2. validation 없이 계산만 수행한다. */
export function sineInOutRaw(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

// ─── expo raw ─────────────────────────────────────────────────────────────────

/** t === 0 ? 0 : 2^(10t - 10). validation 없이 계산만 수행한다. */
export function expoInRaw(t: number): number {
  return t === 0 ? 0 : 2 ** (10 * t - 10);
}

/** t === 1 ? 1 : 1 - 2^(-10t). validation 없이 계산만 수행한다. */
export function expoOutRaw(t: number): number {
  return t === 1 ? 1 : 1 - 2 ** (-10 * t);
}

/** expo ease-in-out. validation 없이 계산만 수행한다. */
export function expoInOutRaw(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  if (t < 0.5) return 2 ** (20 * t - 10) / 2;
  return (2 - 2 ** (-20 * t + 10)) / 2;
}

// ─── circ raw ─────────────────────────────────────────────────────────────────

/** 1 - sqrt(1 - t²). validation 없이 계산만 수행한다. */
export function circInRaw(t: number): number {
  return 1 - Math.sqrt(1 - t * t);
}

/** sqrt(1 - (t-1)²). validation 없이 계산만 수행한다. */
export function circOutRaw(t: number): number {
  return Math.sqrt(1 - (t - 1) ** 2);
}

/** circ ease-in-out. validation 없이 계산만 수행한다. */
export function circInOutRaw(t: number): number {
  if (t < 0.5) {
    return (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2;
  }
  return (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2;
}

// ─── bounce raw ───────────────────────────────────────────────────────────────

/**
 * bounceOut piecewise 계산 내부 함수.
 *
 * validation 없이 계산만 수행한다. 호출 전 finite 검증을 호출자가 보장해야 한다.
 */
export function bounceOutRaw(t: number): number {
  if (t < 1 / BOUNCE_D1) {
    return BOUNCE_N1 * t * t;
  }
  if (t < 2 / BOUNCE_D1) {
    const u = t - 1.5 / BOUNCE_D1;
    return BOUNCE_N1 * u * u + 0.75;
  }
  if (t < 2.5 / BOUNCE_D1) {
    const u = t - 2.25 / BOUNCE_D1;
    return BOUNCE_N1 * u * u + 0.9375;
  }
  const u = t - 2.625 / BOUNCE_D1;
  return BOUNCE_N1 * u * u + 0.984375;
}
