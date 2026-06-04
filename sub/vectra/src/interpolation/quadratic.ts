import { assertFiniteNumbers, clampScalar } from './interpolation.internal';

/**
 * 2차 Bézier scalar 보간값을 반환한다.
 *
 * 공식: `(1-t)^2 * a + 2*(1-t)*t * b + t^2 * c`
 * `t`를 clamp하지 않으며 extrapolation을 허용한다.
 * 모든 인자는 finite number여야 한다.
 *
 * @param a `t === 0`일 때의 값 (시작점)
 * @param b 제어점
 * @param c `t === 1`일 때의 값 (끝점)
 * @param t clamp하지 않는 보간 비율
 */
export function quadratic(a: number, b: number, c: number, t: number): number {
  assertFiniteNumbers([a, b, c, t]);

  const u = 1 - t;

  return u * u * a + 2 * u * t * b + t * t * c;
}

/**
 * t를 `[0, 1]`로 clamp한 뒤 2차 Bézier scalar 보간값을 반환한다.
 *
 * t-clamp 방식이며 extrapolation을 허용하지 않는다.
 * `clampedLerp`와 대칭 설계다.
 * 모든 인자는 finite number여야 한다.
 *
 * @param a `t === 0`일 때의 값 (시작점)
 * @param b 제어점
 * @param c `t === 1`일 때의 값 (끝점)
 * @param t `[0, 1]`로 clamp되는 보간 비율
 */
export function quadraticClamped(a: number, b: number, c: number, t: number): number {
  assertFiniteNumbers([a, b, c, t]);

  const clampedT = clampScalar(t, 0, 1);
  const u = 1 - clampedT;

  return u * u * a + 2 * u * clampedT * b + clampedT * clampedT * c;
}
