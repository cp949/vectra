import { assertFiniteT, assertPositiveFiniteExponent, powerInOutRaw, powerInRaw, powerOutRaw } from './easing.internal';

/**
 * t ** exponent 방식의 ease-in 함수다.
 *
 * exponent는 finite positive number(> 0)여야 한다. 위반 시 RangeError.
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 * @param exponent 지수. finite positive number (> 0)
 */
export function powerIn(t: number, exponent: number): number {
  assertFiniteT(t);
  assertPositiveFiniteExponent(exponent);
  return powerInRaw(t, exponent);
}

/**
 * 1 - (1 - t) ** exponent 방식의 ease-out 함수다.
 *
 * exponent는 finite positive number(> 0)여야 한다. 위반 시 RangeError.
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 * @param exponent 지수. finite positive number (> 0)
 */
export function powerOut(t: number, exponent: number): number {
  assertFiniteT(t);
  assertPositiveFiniteExponent(exponent);
  return powerOutRaw(t, exponent);
}

/**
 * ease-in-out 방식의 polynomial 함수다.
 *
 * t < 0.5이면 (2 * t) ** exponent / 2, t >= 0.5이면 1 - (2 - 2 * t) ** exponent / 2.
 * exponent는 finite positive number(> 0)여야 한다. 위반 시 RangeError.
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 * @param exponent 지수. finite positive number (> 0)
 */
export function powerInOut(t: number, exponent: number): number {
  assertFiniteT(t);
  assertPositiveFiniteExponent(exponent);
  return powerInOutRaw(t, exponent);
}
