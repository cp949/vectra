import { assertFiniteNumbers, clampScalar } from './interpolation.internal';

/**
 * 3차 Bézier scalar 보간값을 반환한다.
 *
 * 공식: `(1-t)^3 * a + 3*(1-t)^2*t * b + 3*(1-t)*t^2 * c + t^3 * d`
 * `t`를 clamp하지 않으며 extrapolation을 허용한다.
 * 모든 인자는 finite number여야 한다.
 *
 * @param a `t === 0`일 때의 값 (시작점)
 * @param b 첫 번째 제어점
 * @param c 두 번째 제어점
 * @param d `t === 1`일 때의 값 (끝점)
 * @param t clamp하지 않는 보간 비율
 */
export function cubic(a: number, b: number, c: number, d: number, t: number): number {
  assertFiniteNumbers([a, b, c, d, t]);

  const u = 1 - t;

  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

/**
 * t를 `[0, 1]`로 clamp한 뒤 3차 Bézier scalar 보간값을 반환한다.
 *
 * t-clamp 방식이며 extrapolation을 허용하지 않는다.
 * `clampedLerp`와 대칭 설계다.
 * 모든 인자는 finite number여야 한다.
 *
 * @param a `t === 0`일 때의 값 (시작점)
 * @param b 첫 번째 제어점
 * @param c 두 번째 제어점
 * @param d `t === 1`일 때의 값 (끝점)
 * @param t `[0, 1]`로 clamp되는 보간 비율
 */
export function cubicClamped(a: number, b: number, c: number, d: number, t: number): number {
  assertFiniteNumbers([a, b, c, d, t]);

  const clampedT = clampScalar(t, 0, 1);
  const u = 1 - clampedT;

  return (
    u * u * u * a + 3 * u * u * clampedT * b + 3 * u * clampedT * clampedT * c + clampedT * clampedT * clampedT * d
  );
}
