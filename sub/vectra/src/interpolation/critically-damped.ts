import { assertFiniteNumbers } from './interpolation.internal';
import { assertNonNegativeDt, assertPositiveAngularFrequency, criticallyDampedStep } from './motion.internal';
import type { CriticallyDampedOptions, SpringMotionResult } from './types';

const DEFAULT_ANGULAR_FREQUENCY = 12;

/**
 * 임계 감쇠(damping ratio 1) 조화 진동자의 다음 scalar state를 반환한다.
 *
 * damping ratio 1 closed-form update다. displacement
 * `x = current - target`, `w = angularFrequency`, `c = velocity + w * x`, `e = Math.exp(-w * dt)`
 * 기준으로 `value = target + (x + c * dt) * e`, `velocity = (velocity - w * c * dt) * e`를 계산한다.
 *
 * `dt === 0`이면 `{ value: current, velocity }`를 반환한다.
 * 초기 velocity가 target 방향으로 충분히 크면 target을 지날 수 있다.
 * `dt`는 호출자가 정의한 시간 단위다. 함수는 단위를 변환하지 않는다.
 * `velocity`는 value unit per dt unit이다.
 * current, target, velocity, dt, angularFrequency는 finite number여야 한다.
 * `dt < 0`이면 RangeError를 던진다.
 * `angularFrequency <= 0`이면 RangeError를 던진다.
 *
 * @param current 현재 위치
 * @param target 수렴 목표 위치
 * @param velocity 현재 속도. value unit per dt unit.
 * @param dt 시간 간격. 0 이상의 finite number여야 한다.
 * @param options `angularFrequency`(기본 12, `> 0`)로 수렴 속도를 제어한다.
 */
export function criticallyDamped(
  current: number,
  target: number,
  velocity: number,
  dt: number,
  options?: CriticallyDampedOptions
): SpringMotionResult {
  const angularFrequency = options?.angularFrequency ?? DEFAULT_ANGULAR_FREQUENCY;

  assertFiniteNumbers([current, target, velocity, dt, angularFrequency]);
  assertNonNegativeDt(dt);
  assertPositiveAngularFrequency(angularFrequency);

  const [nextX, nextVelocity] = criticallyDampedStep(current - target, velocity, angularFrequency, dt);

  return { value: target + nextX, velocity: nextVelocity };
}
