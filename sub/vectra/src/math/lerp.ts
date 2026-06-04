import { assertFiniteNumbers } from './range.internal';

/**
 * a와 b 사이의 선형 보간값을 반환한다.
 *
 * 모든 인자는 finite number여야 한다. `t`는 clamp하지 않으며 extrapolation을 허용한다.
 *
 * @param a `t === 0`일 때의 값
 * @param b `t === 1`일 때의 값
 * @param t clamp하지 않는 보간 비율
 */
export function lerp(a: number, b: number, t: number): number {
  assertFiniteNumbers([a, b, t]);

  return a + (b - a) * t;
}
