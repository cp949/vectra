import { assertFiniteT, expoInOutRaw, expoInRaw, expoOutRaw } from './easing.internal';

/**
 * exponential ease-in 함수다.
 *
 * 수식: `t === 0 ? 0 : 2 ** (10 * t - 10)`
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function expoIn(t: number): number {
  assertFiniteT(t);
  return expoInRaw(t);
}

/**
 * exponential ease-out 함수다.
 *
 * 수식: `t === 1 ? 1 : 1 - 2 ** (-10 * t)`
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function expoOut(t: number): number {
  assertFiniteT(t);
  return expoOutRaw(t);
}

/**
 * exponential ease-in-out 함수다.
 *
 * t < 0.5: `2 ** (20 * t - 10) / 2`
 * t >= 0.5: `(2 - 2 ** (-20 * t + 10)) / 2`
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function expoInOut(t: number): number {
  assertFiniteT(t);
  return expoInOutRaw(t);
}
