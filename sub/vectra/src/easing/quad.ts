import { assertFiniteT, powerInOutRaw, powerInRaw, powerOutRaw } from './easing.internal';

/** quadratic easing 지수 */
const QUAD_EXPONENT = 2;

/**
 * 2차 polynomial ease-in 함수다. powerIn(t, 2)와 동일하다.
 *
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function quadIn(t: number): number {
  assertFiniteT(t);
  return powerInRaw(t, QUAD_EXPONENT);
}

/**
 * 2차 polynomial ease-out 함수다. powerOut(t, 2)와 동일하다.
 *
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function quadOut(t: number): number {
  assertFiniteT(t);
  return powerOutRaw(t, QUAD_EXPONENT);
}

/**
 * 2차 polynomial ease-in-out 함수다. powerInOut(t, 2)와 동일하다.
 *
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function quadInOut(t: number): number {
  assertFiniteT(t);
  return powerInOutRaw(t, QUAD_EXPONENT);
}
