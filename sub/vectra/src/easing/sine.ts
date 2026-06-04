import { assertFiniteT, sineInOutRaw, sineInRaw, sineOutRaw } from './easing.internal';

/**
 * sine 기반 ease-in 함수다.
 *
 * 수식: `1 - Math.cos(t * Math.PI / 2)`
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function sineIn(t: number): number {
  assertFiniteT(t);
  // cos(PI/2) ≈ 6e-17이므로 수식이 정확한 1을 반환하지 않는다
  if (t === 1) return 1;
  return sineInRaw(t);
}

/**
 * sine 기반 ease-out 함수다.
 *
 * 수식: `Math.sin(t * Math.PI / 2)`
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function sineOut(t: number): number {
  assertFiniteT(t);
  return sineOutRaw(t);
}

/**
 * sine 기반 ease-in-out 함수다.
 *
 * 수식: `-(Math.cos(Math.PI * t) - 1) / 2`
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function sineInOut(t: number): number {
  assertFiniteT(t);
  // t === 0: 수식이 -0을 반환한다
  if (t === 0) return 0;
  // t === 0.5: cos(PI/2) ≈ 6e-17 → 결과가 0.5에서 벗어난다
  if (t === 0.5) return 0.5;
  return sineInOutRaw(t);
}
