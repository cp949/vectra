/**
 * interpolation deterministic simulation helper(`exponentialDecay`, `criticallyDamped`,
 * `springLerp`)의 closed-form contract와 validation을 고정하는 unit test다.
 */

import { describe, expect, test } from 'vitest';
import { criticallyDamped } from '../../../src/interpolation/critically-damped';
import { exponentialDecay } from '../../../src/interpolation/exponential-decay';
import { springLerp } from '../../../src/interpolation/spring-lerp';

const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

/** 임계 감쇠 closed-form expected state를 test 안에서 독립 계산한다. */
function expectedCriticallyDamped(
  current: number,
  target: number,
  velocity: number,
  dt: number,
  angularFrequency: number
): { value: number; velocity: number } {
  const x = current - target;
  const c = velocity + angularFrequency * x;
  const e = Math.exp(-angularFrequency * dt);

  return {
    value: target + (x + c * dt) * e,
    velocity: (velocity - angularFrequency * c * dt) * e,
  };
}

describe('interpolation exponentialDecay', () => {
  test('closed-form `target + (current - target) * exp(-decayRate * dt)`를 계산한다', () => {
    expect(exponentialDecay(0, 10, 1, Math.log(2))).toBeCloseTo(5, 12);
    expect(exponentialDecay(10, 0, 2, 0.5)).toBeCloseTo(10 * Math.exp(-1), 12);
  });

  test('decayRate가 클수록 target에 더 가까워진다', () => {
    const slow = exponentialDecay(0, 10, 1, 0.5);
    const fast = exponentialDecay(0, 10, 5, 0.5);

    expect(fast).toBeGreaterThan(slow);
    expect(fast).toBeLessThan(10);
  });

  test('dt === 0이면 current를 반환한다', () => {
    expect(exponentialDecay(3, 10, 5, 0)).toBe(3);
  });

  test('decayRate === 0이면 current를 반환한다', () => {
    expect(exponentialDecay(3, 10, 0, 2)).toBe(3);
  });

  test('current === target이면 target을 반환한다', () => {
    expect(exponentialDecay(7, 7, 4, 0.25)).toBe(7);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => exponentialDecay(value, 10, 1, 0.5)).toThrow(RangeError);
    expect(() => exponentialDecay(0, value, 1, 0.5)).toThrow(RangeError);
    expect(() => exponentialDecay(0, 10, value, 0.5)).toThrow(RangeError);
    expect(() => exponentialDecay(0, 10, 1, value)).toThrow(RangeError);
  });

  test('decayRate < 0이면 RangeError를 던진다', () => {
    expect(() => exponentialDecay(0, 10, -1, 0.5)).toThrow(RangeError);
  });

  test('dt < 0이면 RangeError를 던진다', () => {
    expect(() => exponentialDecay(0, 10, 1, -0.5)).toThrow(RangeError);
  });
});

describe('interpolation criticallyDamped', () => {
  test('dt === 0이면 현재 state를 반환한다', () => {
    expect(criticallyDamped(3, 10, 2, 0)).toEqual({ value: 3, velocity: 2 });
  });

  test('current === target이고 velocity === 0이면 정지 상태를 반환한다', () => {
    expect(criticallyDamped(5, 5, 0, 0.1)).toEqual({ value: 5, velocity: 0 });
  });

  test('velocity === 0에서 target에 가까워지고 target을 지나지 않는다', () => {
    const result = criticallyDamped(10, 0, 0, 0.1);

    expect(result.value).toBeGreaterThan(0);
    expect(result.value).toBeLessThan(10);
    expect(result.velocity).toBeLessThan(0);
  });

  test('target 방향 velocity가 충분히 크면 target을 지날 수 있다', () => {
    const result = criticallyDamped(10, 0, -200, 0.13);

    expect(result.value).toBeLessThan(0);
    expect(result.velocity).toBeLessThan(0);
  });

  test('non-zero velocity가 closed-form formula와 일치한다 (기본 angularFrequency 12)', () => {
    const expected = expectedCriticallyDamped(2, 8, 1.5, 0.05, 12);
    const result = criticallyDamped(2, 8, 1.5, 0.05);

    expect(result.value).toBeCloseTo(expected.value, 12);
    expect(result.velocity).toBeCloseTo(expected.velocity, 12);
  });

  test('custom angularFrequency가 closed-form formula와 일치한다', () => {
    const expected = expectedCriticallyDamped(2, 8, 1.5, 0.05, 20);
    const result = criticallyDamped(2, 8, 1.5, 0.05, { angularFrequency: 20 });

    expect(result.value).toBeCloseTo(expected.value, 12);
    expect(result.velocity).toBeCloseTo(expected.velocity, 12);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => criticallyDamped(value, 8, 1, 0.05)).toThrow(RangeError);
    expect(() => criticallyDamped(2, value, 1, 0.05)).toThrow(RangeError);
    expect(() => criticallyDamped(2, 8, value, 0.05)).toThrow(RangeError);
    expect(() => criticallyDamped(2, 8, 1, value)).toThrow(RangeError);
    expect(() => criticallyDamped(2, 8, 1, 0.05, { angularFrequency: value })).toThrow(RangeError);
  });

  test('dt < 0이면 RangeError를 던진다', () => {
    expect(() => criticallyDamped(2, 8, 1, -0.05)).toThrow(RangeError);
  });

  test('angularFrequency <= 0이면 RangeError를 던진다', () => {
    expect(() => criticallyDamped(2, 8, 1, 0.05, { angularFrequency: 0 })).toThrow(RangeError);
    expect(() => criticallyDamped(2, 8, 1, 0.05, { angularFrequency: -5 })).toThrow(RangeError);
  });
});

/** underdamped(`z < 1`) closed-form expected state를 test 안에서 독립 계산한다. */
function expectedUnderdamped(
  current: number,
  target: number,
  velocity: number,
  dt: number,
  w: number,
  z: number
): { value: number; velocity: number } {
  const x = current - target;
  const wd = w * Math.sqrt(1 - z * z);
  const e = Math.exp(-z * w * dt);
  const c1 = x;
  const c2 = (velocity + z * w * x) / wd;
  const cos = Math.cos(wd * dt);
  const sin = Math.sin(wd * dt);

  return {
    value: target + e * (c1 * cos + c2 * sin),
    velocity: e * ((c2 * wd - z * w * c1) * cos - (c1 * wd + z * w * c2) * sin),
  };
}

/** overdamped(`z > 1`) closed-form expected state를 test 안에서 독립 계산한다. */
function expectedOverdamped(
  current: number,
  target: number,
  velocity: number,
  dt: number,
  w: number,
  z: number
): { value: number; velocity: number } {
  const x = current - target;
  const s = w * Math.sqrt(z * z - 1);
  const r1 = -w * z + s;
  const r2 = -w * z - s;
  const a = (velocity - r2 * x) / (r1 - r2);
  const b = x - a;
  const e1 = Math.exp(r1 * dt);
  const e2 = Math.exp(r2 * dt);

  return {
    value: target + a * e1 + b * e2,
    velocity: a * r1 * e1 + b * r2 * e2,
  };
}

describe('interpolation springLerp', () => {
  test('dampingRatio === 1이면 criticallyDamped와 bit-identical 결과를 반환한다', () => {
    // springStep의 critical 분기가 criticallyDampedStep을 그대로 위임하므로 결과는 근사가 아니라 정확히 같다.
    const spring = springLerp(2, 8, 1.5, 0.05, {
      dampingRatio: 1,
      angularFrequency: 12,
    });
    const critical = criticallyDamped(2, 8, 1.5, 0.05, {
      angularFrequency: 12,
    });

    expect(spring.value).toBe(critical.value);
    expect(spring.velocity).toBe(critical.velocity);
  });

  test('기본 옵션(dampingRatio 1, angularFrequency 12)도 criticallyDamped와 bit-identical하다', () => {
    const spring = springLerp(2, 8, 1.5, 0.05);
    const critical = criticallyDamped(2, 8, 1.5, 0.05);

    expect(spring.value).toBe(critical.value);
    expect(spring.velocity).toBe(critical.velocity);
  });

  test('underdamped(dampingRatio < 1)가 closed-form과 일치한다', () => {
    const expected = expectedUnderdamped(10, 0, 0, 0.1, 12, 0.5);
    const result = springLerp(10, 0, 0, 0.1, {
      dampingRatio: 0.5,
      angularFrequency: 12,
    });

    expect(result.value).toBeCloseTo(expected.value, 12);
    expect(result.velocity).toBeCloseTo(expected.velocity, 12);
  });

  test('overdamped(dampingRatio > 1)가 closed-form과 일치한다', () => {
    const expected = expectedOverdamped(10, 0, 0, 0.1, 12, 2);
    const result = springLerp(10, 0, 0, 0.1, {
      dampingRatio: 2,
      angularFrequency: 12,
    });

    expect(result.value).toBeCloseTo(expected.value, 12);
    expect(result.velocity).toBeCloseTo(expected.velocity, 12);
  });

  test('dampingRatio === 0은 undamped 진동으로 energy를 보존한다', () => {
    // 무감쇠: 초기 변위만 있으면 1/4 주기 후 변위 0, 속도가 -w*amplitude에 도달한다.
    const w = 10;
    const quarterPeriod = Math.PI / (2 * w);
    const result = springLerp(5, 0, 0, quarterPeriod, {
      dampingRatio: 0,
      angularFrequency: w,
    });

    expect(result.value).toBeCloseTo(0, 9);
    expect(result.velocity).toBeCloseTo(-w * 5, 9);
  });

  test('dampingRatio 경계 근처(0.999, 1.001)에서도 수치적으로 안정적이다', () => {
    const justUnder = springLerp(10, 0, 0, 0.05, {
      dampingRatio: 0.999,
      angularFrequency: 12,
    });
    const justOver = springLerp(10, 0, 0, 0.05, {
      dampingRatio: 1.001,
      angularFrequency: 12,
    });
    const critical = criticallyDamped(10, 0, 0, 0.05, { angularFrequency: 12 });

    // value와 velocity 모두 ζ=1 양쪽에서 critical 값으로 연속이어야 한다.
    // ζ=0.999/1.001과 ζ=1의 차이는 near-singular 나눗셈 노이즈가 아니라 실제 물리적 차이이므로
    // bit-동치가 아닌 상대 근접도로 확인한다. velocity는 wd = w√(1-z²) 나눗셈이 일어나는 곳이라 가장 민감하다.
    const relativeError = (actual: number, expected: number): number =>
      Math.abs(actual - expected) / Math.max(Math.abs(expected), 1);

    expect(relativeError(justUnder.value, critical.value)).toBeLessThan(1e-3);
    expect(relativeError(justOver.value, critical.value)).toBeLessThan(1e-3);
    expect(relativeError(justUnder.velocity, critical.velocity)).toBeLessThan(1e-3);
    expect(relativeError(justOver.velocity, critical.velocity)).toBeLessThan(1e-3);
  });

  test('dt === 0이면 현재 state를 반환한다', () => {
    expect(springLerp(3, 10, 2, 0, { dampingRatio: 0.5 })).toEqual({
      value: 3,
      velocity: 2,
    });
    expect(springLerp(3, 10, 2, 0, { dampingRatio: 2 })).toEqual({
      value: 3,
      velocity: 2,
    });
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => springLerp(value, 8, 1, 0.05)).toThrow(RangeError);
    expect(() => springLerp(2, value, 1, 0.05)).toThrow(RangeError);
    expect(() => springLerp(2, 8, value, 0.05)).toThrow(RangeError);
    expect(() => springLerp(2, 8, 1, value)).toThrow(RangeError);
    expect(() => springLerp(2, 8, 1, 0.05, { angularFrequency: value })).toThrow(RangeError);
    expect(() => springLerp(2, 8, 1, 0.05, { dampingRatio: value })).toThrow(RangeError);
  });

  test('dt < 0이면 RangeError를 던진다', () => {
    expect(() => springLerp(2, 8, 1, -0.05)).toThrow(RangeError);
  });

  test('angularFrequency <= 0이면 RangeError를 던진다', () => {
    expect(() => springLerp(2, 8, 1, 0.05, { angularFrequency: 0 })).toThrow(RangeError);
    expect(() => springLerp(2, 8, 1, 0.05, { angularFrequency: -3 })).toThrow(RangeError);
  });

  test('dampingRatio < 0이면 RangeError를 던진다', () => {
    expect(() => springLerp(2, 8, 1, 0.05, { dampingRatio: -0.1 })).toThrow(RangeError);
  });
});

/**
 * spring ODE(`ẍ = -2ζω ẋ - ω² x`, `x = position - target`)를 RK4로 적분한 reference state다.
 *
 * closed-form 수식과 대수적으로 무관한 독립 검증자다. closed-form 분기에 부호/계수 버그가 있으면
 * 적분 결과와 어긋난다(closed-form expected helper는 구현과 같은 식이라 같은 버그를 잡지 못한다).
 */
function integrateSpringRk4(
  current: number,
  target: number,
  velocity: number,
  dt: number,
  w: number,
  z: number,
  substeps: number
): { value: number; velocity: number } {
  const h = dt / substeps;
  const acc = (x: number, v: number): number => -2 * z * w * v - w * w * x;
  let x = current - target;
  let v = velocity;

  for (let i = 0; i < substeps; i += 1) {
    const k1x = v;
    const k1v = acc(x, v);
    const k2x = v + 0.5 * h * k1v;
    const k2v = acc(x + 0.5 * h * k1x, v + 0.5 * h * k1v);
    const k3x = v + 0.5 * h * k2v;
    const k3v = acc(x + 0.5 * h * k2x, v + 0.5 * h * k2v);
    const k4x = v + h * k3v;
    const k4v = acc(x + h * k3x, v + h * k3v);

    x += (h / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    v += (h / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
  }

  return { value: target + x, velocity: v };
}

describe('interpolation spring closed-form 독립 RK4 교차 검증', () => {
  test('criticallyDamped(ζ=1)가 ODE RK4 적분과 일치한다', () => {
    const reference = integrateSpringRk4(2, 8, 1.5, 0.05, 12, 1, 4000);
    const result = criticallyDamped(2, 8, 1.5, 0.05, { angularFrequency: 12 });

    expect(result.value).toBeCloseTo(reference.value, 5);
    expect(result.velocity).toBeCloseTo(reference.velocity, 5);
  });

  test('springLerp underdamped(ζ<1)가 ODE RK4 적분과 일치한다', () => {
    const reference = integrateSpringRk4(10, 0, 0, 0.1, 12, 0.5, 4000);
    const result = springLerp(10, 0, 0, 0.1, {
      dampingRatio: 0.5,
      angularFrequency: 12,
    });

    expect(result.value).toBeCloseTo(reference.value, 5);
    expect(result.velocity).toBeCloseTo(reference.velocity, 5);
  });

  test('springLerp overdamped(ζ>1)가 ODE RK4 적분과 일치한다', () => {
    const reference = integrateSpringRk4(10, 0, 0, 0.1, 12, 2, 4000);
    const result = springLerp(10, 0, 0, 0.1, {
      dampingRatio: 2,
      angularFrequency: 12,
    });

    expect(result.value).toBeCloseTo(reference.value, 5);
    expect(result.velocity).toBeCloseTo(reference.velocity, 5);
  });
});

describe('interpolation spring 다단계 거동 계약', () => {
  test('criticallyDamped는 정지 상태에서 target을 지나지 않고 단조 수렴한다', () => {
    let value = 10;
    let velocity = 0;
    let previousDistance = Math.abs(value - 0);

    for (let step = 0; step < 200; step += 1) {
      const next = criticallyDamped(value, 0, velocity, 0.02, {
        angularFrequency: 12,
      });
      value = next.value;
      velocity = next.velocity;
      const distance = Math.abs(value - 0);

      // 정지 상태에서는 target(0)을 지나지 않는다: 부호 유지 + 거리 단조 감소.
      expect(value).toBeGreaterThanOrEqual(0);
      expect(distance).toBeLessThanOrEqual(previousDistance);
      previousDistance = distance;
    }

    expect(Math.abs(value)).toBeLessThan(1e-3);
  });

  test('overdamped도 정지 상태에서 target을 지나지 않고 단조 수렴한다', () => {
    let value = 10;
    let velocity = 0;
    let previousDistance = Math.abs(value - 0);

    for (let step = 0; step < 400; step += 1) {
      const next = springLerp(value, 0, velocity, 0.02, {
        dampingRatio: 2,
        angularFrequency: 12,
      });
      value = next.value;
      velocity = next.velocity;
      const distance = Math.abs(value - 0);

      expect(value).toBeGreaterThanOrEqual(0);
      expect(distance).toBeLessThanOrEqual(previousDistance + 1e-12);
      previousDistance = distance;
    }

    expect(Math.abs(value)).toBeLessThan(1e-2);
  });

  test('underdamped는 정지 상태에서 target을 지나쳐 진동한다', () => {
    let value = 10;
    let velocity = 0;
    let minValue = value;

    for (let step = 0; step < 200; step += 1) {
      const next = springLerp(value, 0, velocity, 0.02, {
        dampingRatio: 0.2,
        angularFrequency: 12,
      });
      value = next.value;
      velocity = next.velocity;
      minValue = Math.min(minValue, value);
    }

    // 진동: 어느 시점에 target(0)을 지나 음수 변위로 overshoot한다.
    expect(minValue).toBeLessThan(0);
  });
});
