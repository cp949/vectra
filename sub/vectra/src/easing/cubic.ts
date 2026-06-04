import { assertFiniteT, powerInOutRaw, powerInRaw, powerOutRaw } from './easing.internal';

/** cubic easing 지수 */
const CUBIC_EXPONENT = 3;

/**
 * 3차 polynomial ease-in 함수다. powerIn(t, 3)와 동일하다.
 *
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function cubicIn(t: number): number {
  assertFiniteT(t);
  return powerInRaw(t, CUBIC_EXPONENT);
}

/**
 * 3차 polynomial ease-out 함수다. powerOut(t, 3)와 동일하다.
 *
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function cubicOut(t: number): number {
  assertFiniteT(t);
  return powerOutRaw(t, CUBIC_EXPONENT);
}

/**
 * 3차 polynomial ease-in-out 함수다. powerInOut(t, 3)와 동일하다.
 *
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function cubicInOut(t: number): number {
  assertFiniteT(t);
  return powerInOutRaw(t, CUBIC_EXPONENT);
}
