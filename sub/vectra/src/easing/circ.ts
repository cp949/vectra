import { assertFiniteT, circInOutRaw, circInRaw, circOutRaw } from './easing.internal';

/**
 * circular ease-in 함수다.
 *
 * 수식: `1 - Math.sqrt(1 - t * t)`
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function circIn(t: number): number {
  assertFiniteT(t);
  return circInRaw(t);
}

/**
 * circular ease-out 함수다.
 *
 * 수식: `Math.sqrt(1 - (t - 1) ** 2)`
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function circOut(t: number): number {
  assertFiniteT(t);
  return circOutRaw(t);
}

/**
 * circular ease-in-out 함수다.
 *
 * t < 0.5: `(1 - Math.sqrt(1 - (2 * t) ** 2)) / 2`
 * t >= 0.5: `(Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2`
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function circInOut(t: number): number {
  assertFiniteT(t);
  return circInOutRaw(t);
}
