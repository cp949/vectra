import { assertFiniteNumbers } from './interpolation.internal';
import { assertNonNegativeDt } from './motion.internal';

/**
 * current를 target 방향으로 exponential하게 감쇠시킨 다음 값을 반환한다.
 *
 * `target + (current - target) * Math.exp(-decayRate * dt)`를 계산한다.
 * `decayRate`가 클수록 더 빠르게 target에 수렴한다. half-life를 쓰려면 호출자가
 * `decayRate = Math.LN2 / halfLife`로 변환한다.
 *
 * `decayRate === 0`이면 current를 반환한다.
 * `dt === 0`이면 current를 반환한다.
 * `current === target`이면 target을 반환한다.
 * `dt`는 호출자가 정의한 시간 단위다. 함수는 단위를 변환하지 않는다.
 * current, target, decayRate, dt는 finite number여야 한다.
 * `decayRate < 0` 또는 `dt < 0`이면 RangeError를 던진다.
 *
 * @param current 현재 값
 * @param target 수렴 목표값
 * @param decayRate 감쇠율. 0 이상의 finite number여야 한다.
 * @param dt 시간 간격. 0 이상의 finite number여야 한다.
 */
export function exponentialDecay(current: number, target: number, decayRate: number, dt: number): number {
  assertFiniteNumbers([current, target, decayRate, dt]);

  if (decayRate < 0) {
    throw new RangeError('exponentialDecay decayRate must be non-negative');
  }

  assertNonNegativeDt(dt);

  return target + (current - target) * Math.exp(-decayRate * dt);
}
