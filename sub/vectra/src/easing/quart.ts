import { assertFiniteT, powerInOutRaw, powerInRaw, powerOutRaw } from './easing.internal';

/** quartic easing 지수 */
const QUART_EXPONENT = 4;

/**
 * 4차 polynomial ease-in 함수다. powerIn(t, 4)와 동일하다.
 *
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function quartIn(t: number): number {
  assertFiniteT(t);
  return powerInRaw(t, QUART_EXPONENT);
}

/**
 * 4차 polynomial ease-out 함수다. powerOut(t, 4)와 동일하다.
 *
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function quartOut(t: number): number {
  assertFiniteT(t);
  return powerOutRaw(t, QUART_EXPONENT);
}

/**
 * 4차 polynomial ease-in-out 함수다. powerInOut(t, 4)와 동일하다.
 *
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function quartInOut(t: number): number {
  assertFiniteT(t);
  return powerInOutRaw(t, QUART_EXPONENT);
}
