import { assertFiniteT } from './easing.internal';

/**
 * threshold를 기준으로 0 또는 1을 반환하는 hold easing 함수다.
 *
 * t < threshold이면 0, t >= threshold이면 1을 반환한다.
 * clamp하지 않는다. t < 0이면 0, t > 1이면 1.
 * t와 threshold는 모두 finite number여야 한다.
 *
 * @param t easing progress (보통 [0, 1])
 * @param threshold 전환 기준값. 기본값 0.5
 */
export function hold(t: number, threshold = 0.5): number {
  assertFiniteT(t);

  if (!Number.isFinite(threshold)) {
    throw new RangeError('easing hold threshold must be a finite number');
  }

  return t < threshold ? 0 : 1;
}
