import { assertFiniteNumbers, clampScalar, lerpRaw } from './interpolation.internal';

/**
 * t를 `[0, 1]`로 clamp한 뒤 a와 b 사이의 선형 보간값을 반환한다.
 *
 * result-clamp가 아닌 t-clamp 방식을 사용한다.
 * `clampedLerp(a, b, t) === lerp(a, b, clamp(t, 0, 1))`이 성립한다.
 * `inverseLerpClamped`와 대칭 관계다.
 * 모든 인자는 finite number여야 한다.
 *
 * @param a `t === 0`일 때의 값
 * @param b `t === 1`일 때의 값
 * @param t `[0, 1]`로 clamp되는 보간 비율
 */
export function clampedLerp(a: number, b: number, t: number): number {
  assertFiniteNumbers([a, b, t]);

  // t를 [0, 1]로 clamp한 뒤 lerp한다
  const clampedT = clampScalar(t, 0, 1);

  return lerpRaw(a, b, clampedT);
}
