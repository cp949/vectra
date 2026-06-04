import { assertFiniteT, cubicBezierRaw } from './easing.internal';

/**
 * CSS `ease` preset에 해당하는 scalar easing 함수다.
 *
 * cubic-bezier(0.25, 0.1, 0.25, 1)와 동일하다.
 * t === 0 → 정확히 0, t === 1 → 정확히 1.
 * t는 finite number여야 한다.
 *
 * @param t easing progress (보통 [0, 1])
 */
export function easeCss(t: number): number {
  assertFiniteT(t);
  return cubicBezierRaw(t, 0.25, 0.1, 0.25, 1);
}

/**
 * CSS `ease-in` preset에 해당하는 scalar easing 함수다.
 *
 * cubic-bezier(0.42, 0, 1, 1)와 동일하다.
 * t === 0 → 정확히 0, t === 1 → 정확히 1.
 * t는 finite number여야 한다.
 *
 * @param t easing progress (보통 [0, 1])
 */
export function easeInCss(t: number): number {
  assertFiniteT(t);
  return cubicBezierRaw(t, 0.42, 0, 1, 1);
}

/**
 * CSS `ease-out` preset에 해당하는 scalar easing 함수다.
 *
 * cubic-bezier(0, 0, 0.58, 1)와 동일하다.
 * t === 0 → 정확히 0, t === 1 → 정확히 1.
 * t는 finite number여야 한다.
 *
 * @param t easing progress (보통 [0, 1])
 */
export function easeOutCss(t: number): number {
  assertFiniteT(t);
  return cubicBezierRaw(t, 0, 0, 0.58, 1);
}

/**
 * CSS `ease-in-out` preset에 해당하는 scalar easing 함수다.
 *
 * cubic-bezier(0.42, 0, 0.58, 1)와 동일하다.
 * t === 0 → 정확히 0, t === 1 → 정확히 1.
 * t는 finite number여야 한다.
 *
 * @param t easing progress (보통 [0, 1])
 */
export function easeInOutCss(t: number): number {
  assertFiniteT(t);
  return cubicBezierRaw(t, 0.42, 0, 0.58, 1);
}
