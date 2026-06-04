import { assertFiniteNumbers, lerpRaw } from './interpolation.internal';

/**
 * a와 b 사이의 선형 보간값을 반환한다.
 *
 * `t`를 clamp하지 않으며 extrapolation을 허용한다.
 * `math.lerp`와 동일한 unclamped lerp 정책을 공유하는 discovery alias다.
 * 모든 인자는 finite number여야 한다.
 *
 * @param a `t === 0`일 때의 값
 * @param b `t === 1`일 때의 값
 * @param t clamp하지 않는 보간 비율
 */
export function unclampedLerp(a: number, b: number, t: number): number {
  assertFiniteNumbers([a, b, t]);

  return lerpRaw(a, b, t);
}

/**
 * a와 b 사이의 선형 보간값을 반환한다.
 *
 * GLSL 호환 이름의 `unclampedLerp` alias다. 동일한 계산과 validation을 가진다.
 * `t`를 clamp하지 않으며 extrapolation을 허용한다.
 * 모든 인자는 finite number여야 한다.
 *
 * @param a `t === 0`일 때의 값
 * @param b `t === 1`일 때의 값
 * @param t clamp하지 않는 보간 비율
 */
export function mix(a: number, b: number, t: number): number {
  return unclampedLerp(a, b, t);
}
