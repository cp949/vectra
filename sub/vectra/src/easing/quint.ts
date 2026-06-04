import { assertFiniteT, powerInOutRaw, powerInRaw, powerOutRaw } from './easing.internal';

/** quintic easing 지수 */
const QUINT_EXPONENT = 5;

/**
 * 5차 polynomial ease-in 함수다. powerIn(t, 5)와 동일하다.
 *
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function quintIn(t: number): number {
  assertFiniteT(t);
  return powerInRaw(t, QUINT_EXPONENT);
}

/**
 * 5차 polynomial ease-out 함수다. powerOut(t, 5)와 동일하다.
 *
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function quintOut(t: number): number {
  assertFiniteT(t);
  return powerOutRaw(t, QUINT_EXPONENT);
}

/**
 * 5차 polynomial ease-in-out 함수다. powerInOut(t, 5)와 동일하다.
 *
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function quintInOut(t: number): number {
  assertFiniteT(t);
  return powerInOutRaw(t, QUINT_EXPONENT);
}
