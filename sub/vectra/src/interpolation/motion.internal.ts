/**
 * deterministic simulation helper(`exponentialDecay`, `criticallyDamped`, `springLerp`) 공유 internal.
 *
 * public leaf module끼리 직접 import하지 않으므로 공통 validation과 raw closed-form update를
 * 여기에 모은다. raw helper는 displacement space(`x = current - target`)에서 다음 state를 계산한다.
 */

/**
 * dt가 backward integration이 아닌 0 이상 시간 간격인지 검증한다.
 *
 * dt < 0이면 RangeError를 던진다. dt는 호출 전 finite 검증을 호출자가 보장해야 한다.
 */
export function assertNonNegativeDt(dt: number): void {
  if (dt < 0) {
    throw new RangeError('interpolation dt must be non-negative');
  }
}

/**
 * angularFrequency가 양수인지 검증한다.
 *
 * angularFrequency <= 0이면 RangeError를 던진다. 호출 전 finite 검증을 호출자가 보장해야 한다.
 */
export function assertPositiveAngularFrequency(angularFrequency: number): void {
  if (angularFrequency <= 0) {
    throw new RangeError('interpolation angularFrequency must be positive');
  }
}

/**
 * 임계 감쇠(damping ratio 1) 조화 진동자의 closed-form 다음 state를 displacement space에서 계산한다.
 *
 * displacement `x`(`current - target`)와 velocity `v`에서 시간 `dt` 뒤의 `[nextX, nextVelocity]`를 반환한다.
 * validation 없이 계산만 수행한다. 호출 전 finite, dt >= 0, angularFrequency > 0을 호출자가 보장해야 한다.
 */
export function criticallyDampedStep(
  x: number,
  v: number,
  angularFrequency: number,
  dt: number
): readonly [number, number] {
  const c = v + angularFrequency * x;
  const e = Math.exp(-angularFrequency * dt);
  const nextX = (x + c * dt) * e;
  const nextVelocity = (v - angularFrequency * c * dt) * e;

  return [nextX, nextVelocity];
}

/**
 * 감쇠 조화 진동자(`ẍ + 2ζω ẋ + ω² x = 0`)의 closed-form 다음 state를 displacement space에서 계산한다.
 *
 * dampingRatio `z`에 따라 under(`z < 1`)/critical(`z === 1`)/over(`z > 1`) damping 세 분기를 사용한다.
 * critical 분기는 `criticallyDampedStep`을 그대로 공유하므로 `z === 1`은 임계 감쇠와 동일한 결과다.
 * displacement `x`와 velocity `v`에서 시간 `dt` 뒤의 `[nextX, nextVelocity]`를 반환한다.
 * validation 없이 계산만 수행한다. 호출 전 finite, dt >= 0, angularFrequency > 0, dampingRatio >= 0을
 * 호출자가 보장해야 한다.
 */
export function springStep(
  x: number,
  v: number,
  angularFrequency: number,
  dampingRatio: number,
  dt: number
): readonly [number, number] {
  if (dampingRatio === 1) {
    return criticallyDampedStep(x, v, angularFrequency, dt);
  }

  if (dampingRatio < 1) {
    // underdamped: 감쇠 진동. dampingRatio === 0이면 e = 1로 순수 진동.
    // dampingRatio < 1이면 IEEE-754 double에서 항상 1 - dampingRatio^2 > 0이므로 dampedFrequency > 0이다
    // (dampingRatio === 1은 위 critical 분기에서 처리된다).
    const dampedFrequency = angularFrequency * Math.sqrt(1 - dampingRatio * dampingRatio);
    const decay = Math.exp(-dampingRatio * angularFrequency * dt);
    const c1 = x;
    const c2 = (v + dampingRatio * angularFrequency * x) / dampedFrequency;
    const cos = Math.cos(dampedFrequency * dt);
    const sin = Math.sin(dampedFrequency * dt);
    const nextX = decay * (c1 * cos + c2 * sin);
    const nextVelocity =
      decay *
      ((c2 * dampedFrequency - dampingRatio * angularFrequency * c1) * cos -
        (c1 * dampedFrequency + dampingRatio * angularFrequency * c2) * sin);

    return [nextX, nextVelocity];
  }

  // overdamped: 서로 다른 두 실근의 합. 진동 없이 수렴한다.
  const scaledRoot = angularFrequency * Math.sqrt(dampingRatio * dampingRatio - 1);
  const root1 = -angularFrequency * dampingRatio + scaledRoot;
  const root2 = -angularFrequency * dampingRatio - scaledRoot;
  const coeff1 = (v - root2 * x) / (root1 - root2);
  const coeff2 = x - coeff1;
  const exp1 = Math.exp(root1 * dt);
  const exp2 = Math.exp(root2 * dt);
  const nextX = coeff1 * exp1 + coeff2 * exp2;
  const nextVelocity = coeff1 * root1 * exp1 + coeff2 * root2 * exp2;

  return [nextX, nextVelocity];
}
