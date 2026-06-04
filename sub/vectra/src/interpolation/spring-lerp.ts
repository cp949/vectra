import { assertFiniteNumbers } from './interpolation.internal';
import { assertNonNegativeDt, assertPositiveAngularFrequency, springStep } from './motion.internal';
import type { SpringLerpOptions, SpringMotionResult } from './types';

const DEFAULT_ANGULAR_FREQUENCY = 12;
const DEFAULT_DAMPING_RATIO = 1;

/**
 * 감쇠 조화 진동자(spring)의 다음 scalar state를 반환한다.
 *
 * dampingRatio에 따라 다음 세 동작을 한다.
 * `dampingRatio < 1`은 underdamped로 target 주위를 진동하며 수렴하고, `dampingRatio === 1`은
 * critically damped로 수렴하며, `dampingRatio > 1`은 overdamped로 진동 없이 느리게 수렴한다.
 * 초기 velocity가 target 방향으로 충분히 크면 critical/over damping도 target을 지날 수 있다.
 * `dampingRatio === 0`은 감쇠가 없는 순수 진동이다. `dampingRatio === 1`은
 * 같은 옵션의 `criticallyDamped`와 동일한 결과를 반환한다.
 *
 * `dt === 0`이면 `{ value: current, velocity }`를 반환한다.
 * `dt`는 호출자가 정의한 시간 단위다. 함수는 단위를 변환하지 않는다.
 * `velocity`는 value unit per dt unit이다.
 * current, target, velocity, dt, angularFrequency, dampingRatio는 finite number여야 한다.
 * `dt < 0`이면 RangeError를 던진다.
 * `angularFrequency <= 0`이면 RangeError를 던진다.
 * `dampingRatio < 0`(energy-increasing negative damping)이면 RangeError를 던진다.
 *
 * @param current 현재 위치
 * @param target 수렴 목표 위치
 * @param velocity 현재 속도. value unit per dt unit.
 * @param dt 시간 간격. 0 이상의 finite number여야 한다.
 * @param options `angularFrequency`(기본 12, `> 0`)와 `dampingRatio`(기본 1, `>= 0`)를 제어한다.
 */
export function springLerp(
  current: number,
  target: number,
  velocity: number,
  dt: number,
  options?: SpringLerpOptions
): SpringMotionResult {
  const angularFrequency = options?.angularFrequency ?? DEFAULT_ANGULAR_FREQUENCY;
  const dampingRatio = options?.dampingRatio ?? DEFAULT_DAMPING_RATIO;

  assertFiniteNumbers([current, target, velocity, dt, angularFrequency, dampingRatio]);
  assertNonNegativeDt(dt);
  assertPositiveAngularFrequency(angularFrequency);

  if (dampingRatio < 0) {
    throw new RangeError('springLerp dampingRatio must be non-negative');
  }

  // dt === 0은 현재 state를 그대로 반환한다. closed-form 분기는 dt === 0에서 수학적으로
  // 현재 state와 같지만 분모/지수 재계산으로 부동소수점 오차가 생긴다. 정확한 contract를 위해 단락한다.
  if (dt === 0) {
    return { value: current, velocity };
  }

  const [nextX, nextVelocity] = springStep(current - target, velocity, angularFrequency, dampingRatio, dt);

  return { value: target + nextX, velocity: nextVelocity };
}
