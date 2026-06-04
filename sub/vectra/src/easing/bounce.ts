import { assertFiniteT, bounceOutRaw } from './easing.internal';

/**
 * bounce ease-in 함수다.
 *
 * 진행 방향이 뒤집힌 바운스가 시작 지점에서 발생한다.
 * 수식: `1 - bounceOut(1 - t)`
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function bounceIn(t: number): number {
  assertFiniteT(t);
  return 1 - bounceOutRaw(1 - t);
}

/**
 * bounce ease-out 함수다.
 *
 * 끝 지점으로 다가가며 바운스가 발생한다.
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function bounceOut(t: number): number {
  assertFiniteT(t);
  return bounceOutRaw(t);
}

/**
 * bounce ease-in-out 함수다.
 *
 * t < 0.5: `(1 - bounceOut(1 - 2t)) / 2`
 * t >= 0.5: `(1 + bounceOut(2t - 1)) / 2`
 * t는 finite number여야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 *
 * @param t easing progress (보통 [0, 1])
 */
export function bounceInOut(t: number): number {
  assertFiniteT(t);
  if (t < 0.5) {
    return (1 - bounceOutRaw(1 - 2 * t)) / 2;
  }
  return (1 + bounceOutRaw(2 * t - 1)) / 2;
}
