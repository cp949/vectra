import { assertFiniteT } from './easing.internal';

/**
 * [0, 1] 구간을 steps개의 동일 폭 이산 구간으로 나눠 계단형 값을 반환한다.
 *
 * steps는 양의 정수(>= 1)여야 한다. 위반 시 RangeError.
 * t === 1에서 정확히 1을 반환한다 (endpoint 보장).
 * t는 finite number여야 한다.
 *
 * @param t easing progress (보통 [0, 1])
 * @param steps 계단 수. 양의 정수 >= 1
 */
export function step(t: number, steps: number): number {
  assertFiniteT(t);

  // steps가 양의 정수인지 검증한다
  if (!Number.isInteger(steps) || steps < 1) {
    throw new RangeError('easing step steps must be a positive integer (>= 1)');
  }

  // t === 1 endpoint를 명시적으로 고정한다
  if (t === 1) return 1;

  return Math.floor(t * steps) / steps;
}
