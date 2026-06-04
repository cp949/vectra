/**
 * easing scalar shaping 함수 단위 테스트.
 *
 * sigmoid, bias, gain, impulse, parabola, almostIdentity, expStep,
 * logistic, seat, doubleSeat, cliff
 */

import { describe, expect, test } from 'vitest';
import { almostIdentity } from '../../../src/easing/almost-identity';
import { bias } from '../../../src/easing/bias';
import { cliff } from '../../../src/easing/cliff';
import { doubleSeat } from '../../../src/easing/double-seat';
import { expStep } from '../../../src/easing/exp-step';
import { gain } from '../../../src/easing/gain';
import { impulse } from '../../../src/easing/impulse';
import { logistic } from '../../../src/easing/logistic';
import { parabola } from '../../../src/easing/parabola';
import { seat } from '../../../src/easing/seat';
import { sigmoid } from '../../../src/easing/sigmoid';

/** 비finite 입력 케이스 */
const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

// ─── sigmoid ──────────────────────────────────────────────────────────────────

describe('easing - sigmoid', () => {
  test('default steepness=10 대표 값을 반환한다', () => {
    // t=0.5이면 sigmoid 기준점 → 0.5
    expect(sigmoid(0.5)).toBeCloseTo(0.5, 10);
    // t=0이면 1/(1+exp(5))에 가까운 값
    const expected0 = 1 / (1 + Math.exp(-10 * (0 - 0.5)));
    expect(sigmoid(0)).toBeCloseTo(expected0, 10);
    // t=1이면 1/(1+exp(-5))에 가까운 값
    const expected1 = 1 / (1 + Math.exp(-10 * (1 - 0.5)));
    expect(sigmoid(1)).toBeCloseTo(expected1, 10);
  });

  test('custom steepness 값이 반영된다', () => {
    const t = 0.3;
    const steepness = 5;
    const expected = 1 / (1 + Math.exp(-steepness * (t - 0.5)));
    expect(sigmoid(t, steepness)).toBeCloseTo(expected, 10);
  });

  test('steepness=0이면 항상 0.5를 반환한다', () => {
    expect(sigmoid(0, 0)).toBeCloseTo(0.5, 10);
    expect(sigmoid(0.3, 0)).toBeCloseTo(0.5, 10);
    expect(sigmoid(1, 0)).toBeCloseTo(0.5, 10);
  });

  test('음수 steepness는 반전된 S 곡선을 만든다', () => {
    // 음수 steepness는 허용: t=0이 high, t=1이 low
    const atZero = sigmoid(0, -10);
    const atOne = sigmoid(1, -10);
    expect(atZero).toBeGreaterThan(0.5);
    expect(atOne).toBeLessThan(0.5);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => sigmoid(value)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite steepness %s는 RangeError를 던진다', (value) => {
    expect(() => sigmoid(0.5, value)).toThrow(RangeError);
  });
});

// ─── bias ─────────────────────────────────────────────────────────────────────

describe('easing - bias', () => {
  test('endpoint t=0이면 정확히 0이다', () => {
    expect(bias(0, 0.3)).toBe(0);
    expect(bias(0, 0.7)).toBe(0);
    expect(bias(0, 0.5)).toBe(0);
  });

  test('endpoint t=1이면 정확히 1이다', () => {
    expect(bias(1, 0.3)).toBe(1);
    expect(bias(1, 0.7)).toBe(1);
    expect(bias(1, 0.5)).toBe(1);
  });

  test('amount=0.5이면 identity에 가깝다 (t 그대로)', () => {
    // amount=0.5 → (1/0.5 - 2) = 0 → 분모가 1 → t를 그대로 반환
    expect(bias(0.25, 0.5)).toBeCloseTo(0.25, 10);
    expect(bias(0.75, 0.5)).toBeCloseTo(0.75, 10);
  });

  test('대표 값이 Schlick-style 수식과 일치한다', () => {
    const t = 0.3;
    const amount = 0.7;
    const expected = t / ((1 / amount - 2) * (1 - t) + 1);
    expect(bias(t, amount)).toBeCloseTo(expected, 10);
  });

  test('amount=0은 RangeError를 던진다', () => {
    expect(() => bias(0.5, 0)).toThrow(RangeError);
  });

  test('amount=1은 RangeError를 던진다', () => {
    expect(() => bias(0.5, 1)).toThrow(RangeError);
  });

  test('amount가 음수이면 RangeError를 던진다', () => {
    expect(() => bias(0.5, -0.1)).toThrow(RangeError);
    expect(() => bias(0.5, -1)).toThrow(RangeError);
  });

  test('amount가 1 초과이면 RangeError를 던진다', () => {
    expect(() => bias(0.5, 1.1)).toThrow(RangeError);
    expect(() => bias(0.5, 2)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => bias(value, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite amount %s는 RangeError를 던진다', (value) => {
    expect(() => bias(0.5, value)).toThrow(RangeError);
  });
});

// ─── gain ─────────────────────────────────────────────────────────────────────

describe('easing - gain', () => {
  test('endpoint t=0이면 정확히 0이다', () => {
    expect(gain(0, 0.3)).toBe(0);
    expect(gain(0, 0.7)).toBe(0);
  });

  test('endpoint t=1이면 정확히 1이다', () => {
    expect(gain(1, 0.3)).toBe(1);
    expect(gain(1, 0.7)).toBe(1);
  });

  test('t=0.5이면 정확히 0.5이다', () => {
    expect(gain(0.5, 0.3)).toBeCloseTo(0.5, 10);
    expect(gain(0.5, 0.7)).toBeCloseTo(0.5, 10);
  });

  test('t < 0.5 구간은 bias(2*t, amount) / 2 수식을 따른다', () => {
    const t = 0.25;
    const amount = 0.3;
    // bias(2*t, amount) / 2
    const biasVal = (2 * t) / ((1 / amount - 2) * (1 - 2 * t) + 1);
    expect(gain(t, amount)).toBeCloseTo(biasVal / 2, 10);
  });

  test('t >= 0.5 구간은 1 - bias(2 - 2*t, amount) / 2 수식을 따른다', () => {
    const t = 0.75;
    const amount = 0.3;
    // 1 - bias(2 - 2*t, amount) / 2
    const arg = 2 - 2 * t;
    const biasVal = arg / ((1 / amount - 2) * (1 - arg) + 1);
    expect(gain(t, amount)).toBeCloseTo(1 - biasVal / 2, 10);
  });

  test('amount=0은 RangeError를 던진다', () => {
    expect(() => gain(0.5, 0)).toThrow(RangeError);
  });

  test('amount=1은 RangeError를 던진다', () => {
    expect(() => gain(0.5, 1)).toThrow(RangeError);
  });

  test('amount가 음수이면 RangeError를 던진다', () => {
    expect(() => gain(0.5, -0.5)).toThrow(RangeError);
  });

  test('amount가 1 초과이면 RangeError를 던진다', () => {
    expect(() => gain(0.5, 1.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => gain(value, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite amount %s는 RangeError를 던진다', (value) => {
    expect(() => gain(0.5, value)).toThrow(RangeError);
  });
});

// ─── impulse ──────────────────────────────────────────────────────────────────

describe('easing - impulse', () => {
  test('t=0이면 0을 반환한다', () => {
    expect(impulse(0, 1)).toBe(0);
    expect(impulse(0, 5)).toBe(0);
  });

  test('대표 값이 수식과 일치한다', () => {
    const t = 0.5;
    const k = 3;
    const h = k * t;
    const expected = h * Math.exp(1 - h);
    expect(impulse(t, k)).toBeCloseTo(expected, 10);
  });

  test('peak는 h=1 즉 t=1/k에서 발생한다', () => {
    const k = 4;
    // peak at t = 1/k → h = 1 → result = 1*exp(0) = 1
    expect(impulse(1 / k, k)).toBeCloseTo(1, 10);
  });

  test('k=1일 때 t=1 부근 대표값', () => {
    const t = 1;
    const k = 1;
    const h = k * t;
    const expected = h * Math.exp(1 - h);
    expect(impulse(t, k)).toBeCloseTo(expected, 10);
  });

  test('k가 0이면 RangeError를 던진다', () => {
    expect(() => impulse(0.5, 0)).toThrow(RangeError);
  });

  test('k가 음수이면 RangeError를 던진다', () => {
    expect(() => impulse(0.5, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => impulse(value, 1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite k %s는 RangeError를 던진다', (value) => {
    expect(() => impulse(0.5, value)).toThrow(RangeError);
  });

  test('k * t가 overflow할 때 JavaScript 수식 결과를 따른다', () => {
    // h = Number.MAX_VALUE * 1 = Number.MAX_VALUE
    // h * Math.exp(1 - h) = Number.MAX_VALUE * Math.exp(-Infinity) = Number.MAX_VALUE * 0 = 0
    expect(impulse(1, Number.MAX_VALUE)).toBe(0);
  });
});

// ─── parabola ─────────────────────────────────────────────────────────────────

describe('easing - parabola', () => {
  test('endpoint t=0이면 0이다', () => {
    expect(parabola(0, 1)).toBe(0);
    expect(parabola(0, 2)).toBe(0);
  });

  test('endpoint t=1이면 0이다', () => {
    expect(parabola(1, 1)).toBe(0);
    expect(parabola(1, 2)).toBe(0);
  });

  test('t=0.5 k=1이면 1이다', () => {
    // 4 * 0.5 * (1 - 0.5) = 1, 1^1 = 1
    expect(parabola(0.5, 1)).toBe(1);
  });

  test('t=0.5 k=2이면 1이다', () => {
    // (4*0.5*0.5)^2 = 1^2 = 1
    expect(parabola(0.5, 2)).toBe(1);
  });

  test('대표 값이 수식과 일치한다', () => {
    const t = 0.3;
    const k = 1.5;
    const expected = (4 * t * (1 - t)) ** k;
    expect(parabola(t, k)).toBeCloseTo(expected, 10);
  });

  test('[0,1] 밖 fractional k에서 NaN이 발생할 수 있다 (clamp 안 함)', () => {
    // t가 범위 밖이고 k가 fractional이면 음수의 fractional 제곱 → NaN
    const result = parabola(-0.1, 0.5);
    // 4*(-0.1)*(1.1) = -0.44, (-0.44)^0.5 = NaN
    expect(Number.isNaN(result)).toBe(true);
  });

  test('k가 0이면 RangeError를 던진다', () => {
    expect(() => parabola(0.5, 0)).toThrow(RangeError);
  });

  test('k가 음수이면 RangeError를 던진다', () => {
    expect(() => parabola(0.5, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => parabola(value, 1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite k %s는 RangeError를 던진다', (value) => {
    expect(() => parabola(0.5, value)).toThrow(RangeError);
  });
});

// ─── almostIdentity ───────────────────────────────────────────────────────────

describe('easing - almostIdentity', () => {
  test('t > m이면 t를 그대로 반환한다', () => {
    expect(almostIdentity(0.5, 0.3, 0.1)).toBe(0.5);
    expect(almostIdentity(1, 0.3, 0.1)).toBe(1);
    expect(almostIdentity(2, 0.5, 0.2)).toBe(2);
  });

  test('t=0 m=0.1 n=0.05 cubic branch 대표값', () => {
    const t = 0;
    const m = 0.1;
    const n = 0.05;
    // a = 2*n - m = 0.1 - 0.1 = 0, b = 2*m - 3*n = 0.2 - 0.15 = 0.05
    // result = ((a*t + b)*t*t) / (m*m) + n
    // = ((0*0 + 0.05)*0*0) / 0.01 + 0.05 = 0 + 0.05 = 0.05
    expect(almostIdentity(t, m, n)).toBeCloseTo(n, 10);
  });

  test('t=0일 때 cubic branch 결과는 n이다', () => {
    // t=0: ((a*0 + b)*0*0)/(m*m) + n = 0 + n = n
    expect(almostIdentity(0, 0.2, 0.1)).toBeCloseTo(0.1, 10);
    expect(almostIdentity(0, 0.5, 0.2)).toBeCloseTo(0.2, 10);
  });

  test('수식 직접 대조', () => {
    const t = 0.05;
    const m = 0.2;
    const n = 0.1;
    const a = 2 * n - m;
    const b = 2 * m - 3 * n;
    const expected = ((a * t + b) * t * t) / (m * m) + n;
    expect(almostIdentity(t, m, n)).toBeCloseTo(expected, 10);
  });

  test('m=0은 RangeError를 던진다', () => {
    expect(() => almostIdentity(0.5, 0, 0.1)).toThrow(RangeError);
  });

  test('m이 음수이면 RangeError를 던진다', () => {
    expect(() => almostIdentity(0.5, -0.1, 0.1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => almostIdentity(value, 0.2, 0.1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite m %s는 RangeError를 던진다', (value) => {
    expect(() => almostIdentity(0.5, value, 0.1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite n %s는 RangeError를 던진다', (value) => {
    expect(() => almostIdentity(0.5, 0.2, value)).toThrow(RangeError);
  });
});

// ─── expStep ──────────────────────────────────────────────────────────────────

describe('easing - expStep', () => {
  test('t=0이면 1이다', () => {
    // exp(-k * 0^n) = exp(0) = 1
    expect(expStep(0, 1, 1)).toBe(1);
    expect(expStep(0, 5, 2)).toBe(1);
  });

  test('대표 값이 수식과 일치한다', () => {
    const t = 0.5;
    const k = 2;
    const n = 1.5;
    const expected = Math.exp(-k * t ** n);
    expect(expStep(t, k, n)).toBeCloseTo(expected, 10);
  });

  test('t 증가에 따라 값이 감소한다', () => {
    const k = 2;
    const n = 1;
    expect(expStep(0.1, k, n)).toBeGreaterThan(expStep(0.5, k, n));
    expect(expStep(0.5, k, n)).toBeGreaterThan(expStep(1, k, n));
  });

  test('음수 t와 fractional n에서 NaN이 발생할 수 있다 (clamp 안 함)', () => {
    // (-0.5)^0.5 = NaN → exp(NaN) = NaN
    const result = expStep(-0.5, 1, 0.5);
    expect(Number.isNaN(result)).toBe(true);
  });

  test('k가 0이면 RangeError를 던진다', () => {
    expect(() => expStep(0.5, 0, 1)).toThrow(RangeError);
  });

  test('k가 음수이면 RangeError를 던진다', () => {
    expect(() => expStep(0.5, -1, 1)).toThrow(RangeError);
  });

  test('n이 0이면 RangeError를 던진다', () => {
    expect(() => expStep(0.5, 1, 0)).toThrow(RangeError);
  });

  test('n이 음수이면 RangeError를 던진다', () => {
    expect(() => expStep(0.5, 1, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => expStep(value, 1, 1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite k %s는 RangeError를 던진다', (value) => {
    expect(() => expStep(0.5, value, 1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite n %s는 RangeError를 던진다', (value) => {
    expect(() => expStep(0.5, 1, value)).toThrow(RangeError);
  });
});

// ─── logistic ─────────────────────────────────────────────────────────────────

/** endpoint-normalized centered logistic 기대값 (validation 없는 raw). */
function logisticExpected(t: number, steepness: number): number {
  const lo = 1 / (1 + Math.exp(0.5 * steepness));
  const hi = 1 / (1 + Math.exp(-0.5 * steepness));
  const lt = 1 / (1 + Math.exp(-steepness * (t - 0.5)));
  return (lt - lo) / (hi - lo);
}

describe('easing - logistic', () => {
  test('default steepness=10 대표 값이 정규화 logistic과 일치한다', () => {
    expect(logistic(0.3)).toBeCloseTo(logisticExpected(0.3, 10), 10);
    expect(logistic(0.7)).toBeCloseTo(logisticExpected(0.7, 10), 10);
  });

  test('custom steepness 값이 반영된다', () => {
    expect(logistic(0.3, { steepness: 5 })).toBeCloseTo(logisticExpected(0.3, 5), 10);
    expect(logistic(0.8, { steepness: 20 })).toBeCloseTo(logisticExpected(0.8, 20), 10);
  });

  test('endpoint t=0 → 0, t=1 → 1, t=0.5 → 0.5 (exact)', () => {
    expect(logistic(0)).toBe(0);
    expect(logistic(1)).toBe(1);
    expect(logistic(0.5)).toBe(0.5);
    expect(logistic(0, { steepness: 3 })).toBe(0);
    expect(logistic(1, { steepness: 3 })).toBe(1);
  });

  test('단조 증가한다', () => {
    expect(logistic(0.25)).toBeLessThan(logistic(0.5));
    expect(logistic(0.5)).toBeLessThan(logistic(0.75));
  });

  test('sigmoid와 달리 endpoint를 exact 보장한다 (regression)', () => {
    // sigmoid(0)은 0이 아니지만 logistic(0)은 정확히 0이다.
    expect(sigmoid(0)).not.toBe(0);
    expect(logistic(0)).toBe(0);
    expect(sigmoid(1)).not.toBe(1);
    expect(logistic(1)).toBe(1);
  });

  test('steepness=0은 RangeError를 던진다 (sigmoid는 허용)', () => {
    expect(() => logistic(0.5, { steepness: 0 })).toThrow(RangeError);
  });

  test('음수 steepness는 RangeError를 던진다 (sigmoid는 허용)', () => {
    expect(() => logistic(0.5, { steepness: -10 })).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => logistic(value)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite steepness %s는 RangeError를 던진다', (value) => {
    expect(() => logistic(0.5, { steepness: value })).toThrow(RangeError);
  });
});

// ─── seat ─────────────────────────────────────────────────────────────────────

describe('easing - seat', () => {
  test('default power=2 대표 값이 수식과 일치한다', () => {
    // t<0.5: 0.5*(1-(1-2t)^2)
    expect(seat(0.25)).toBeCloseTo(0.5 * (1 - (1 - 2 * 0.25) ** 2), 10);
    // t>=0.5: 0.5+0.5*(2t-1)^2
    expect(seat(0.75)).toBeCloseTo(0.5 + 0.5 * (2 * 0.75 - 1) ** 2, 10);
  });

  test('custom power 값이 반영된다', () => {
    expect(seat(0.3, { power: 3 })).toBeCloseTo(0.5 * (1 - (1 - 2 * 0.3) ** 3), 10);
    expect(seat(0.8, { power: 3 })).toBeCloseTo(0.5 + 0.5 * (2 * 0.8 - 1) ** 3, 10);
  });

  test('endpoint t=0 → 0, t=1 → 1, t=0.5 → 0.5 (exact)', () => {
    expect(seat(0)).toBe(0);
    expect(seat(1)).toBe(1);
    expect(seat(0.5)).toBe(0.5);
  });

  test('대칭이다: seat(0.5 - d) + seat(0.5 + d) === 1', () => {
    expect(seat(0.3) + seat(0.7)).toBeCloseTo(1, 10);
    expect(seat(0.1, { power: 4 }) + seat(0.9, { power: 4 })).toBeCloseTo(1, 10);
  });

  test('power=1이면 linear(identity)와 같다', () => {
    expect(seat(0.25, { power: 1 })).toBeCloseTo(0.25, 10);
    expect(seat(0.6, { power: 1 })).toBeCloseTo(0.6, 10);
  });

  test('power>1이면 중앙 근처가 평탄하다 (powerInOut 반대 곡선 regression)', () => {
    // 중앙 부근(t=0.5±ε)에서 0.5에 가깝게 머문다: |seat-0.5| < |linear-0.5|는 아니고,
    // ease-out-in이므로 t=0.25에서 0.25보다 큰 값(빠르게 오른 뒤 평탄).
    expect(seat(0.25, { power: 2 })).toBeGreaterThan(0.25);
    expect(seat(0.75, { power: 2 })).toBeLessThan(0.75);
  });

  test('power=0이면 RangeError를 던진다', () => {
    expect(() => seat(0.5, { power: 0 })).toThrow(RangeError);
  });

  test('음수 power는 RangeError를 던진다', () => {
    expect(() => seat(0.5, { power: -2 })).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => seat(value)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite power %s는 RangeError를 던진다', (value) => {
    expect(() => seat(0.5, { power: value })).toThrow(RangeError);
  });
});

// ─── doubleSeat ─────────────────────────────────────────────────────────────────

describe('easing - doubleSeat', () => {
  test('default center=0.5, power=2이면 seat과 동일하다', () => {
    expect(doubleSeat(0.25)).toBeCloseTo(seat(0.25), 12);
    expect(doubleSeat(0.75)).toBeCloseTo(seat(0.75), 12);
  });

  test('custom center 대표 값이 수식과 일치한다', () => {
    const c = 0.45;
    const p = 3;
    // t<=c: 0.5*(1-(1-t/c)^p)
    expect(doubleSeat(0.2, { center: c, power: p })).toBeCloseTo(0.5 * (1 - (1 - 0.2 / c) ** p), 10);
    // t>c: 0.5+0.5*((t-c)/(1-c))^p
    expect(doubleSeat(0.8, { center: c, power: p })).toBeCloseTo(0.5 + 0.5 * ((0.8 - c) / (1 - c)) ** p, 10);
  });

  test('endpoint t=0 → 0, t=center → 0.5, t=1 → 1 (exact)', () => {
    expect(doubleSeat(0, { center: 0.3 })).toBe(0);
    expect(doubleSeat(0.3, { center: 0.3 })).toBe(0.5);
    expect(doubleSeat(1, { center: 0.3 })).toBe(1);
  });

  test('center=0은 RangeError를 던진다 (division by zero)', () => {
    expect(() => doubleSeat(0.5, { center: 0 })).toThrow(RangeError);
  });

  test('center=1은 RangeError를 던진다 (division by zero)', () => {
    expect(() => doubleSeat(0.5, { center: 1 })).toThrow(RangeError);
  });

  test('center가 (0,1) 밖이면 RangeError를 던진다', () => {
    expect(() => doubleSeat(0.5, { center: -0.1 })).toThrow(RangeError);
    expect(() => doubleSeat(0.5, { center: 1.2 })).toThrow(RangeError);
  });

  test('power=0이면 RangeError를 던진다', () => {
    expect(() => doubleSeat(0.5, { power: 0 })).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => doubleSeat(value)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite center %s는 RangeError를 던진다', (value) => {
    expect(() => doubleSeat(0.5, { center: value })).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite power %s는 RangeError를 던진다', (value) => {
    expect(() => doubleSeat(0.5, { power: value })).toThrow(RangeError);
  });
});

// ─── cliff ─────────────────────────────────────────────────────────────────────

describe('easing - cliff', () => {
  test('default threshold=0.5, width=0.1: band 밖 평탄, band 안 전이', () => {
    // edge0≈0.45, edge1≈0.55. band 밖 안전 지점으로 평탄 확인 (정확한 edge는 float 의존).
    expect(cliff(0.4)).toBe(0);
    expect(cliff(0.6)).toBe(1);
    // 중심 0.5 → smoothstep(0.5) = 0.5
    expect(cliff(0.5)).toBeCloseTo(0.5, 10);
  });

  test('band 안 대표 값이 smoothstep ramp와 일치한다', () => {
    const threshold = 0.5;
    const width = 0.1;
    const t = 0.48;
    const u = (t - (threshold - width / 2)) / width;
    expect(cliff(t)).toBeCloseTo(u * u * (3 - 2 * u), 10);
  });

  test('custom threshold/width가 반영된다', () => {
    // threshold=0.3, width=0.2 → edge0≈0.2, edge1≈0.4. band 밖 안전 지점으로 평탄 확인.
    expect(cliff(0.15, { threshold: 0.3, width: 0.2 })).toBe(0);
    expect(cliff(0.45, { threshold: 0.3, width: 0.2 })).toBe(1);
    expect(cliff(0.3, { threshold: 0.3, width: 0.2 })).toBeCloseTo(0.5, 10);
  });

  test('단조 증가하며 band 안에서 0과 1 사이 중간값을 갖는다 (hard step 아님)', () => {
    const a = cliff(0.47);
    const b = cliff(0.5);
    const c = cliff(0.53);
    expect(a).toBeGreaterThan(0);
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
    expect(c).toBeLessThan(1);
  });

  test('hold/step과 달리 threshold 부근에서 연속 전이다 (regression)', () => {
    // hold(0.5)=1로 즉시 점프하지만 cliff은 threshold 직전에 0이고 band 안에서 점진 상승.
    expect(cliff(0.46)).toBeGreaterThan(0);
    expect(cliff(0.46)).toBeLessThan(0.5);
  });

  test('endpoint t=0 → 0, t=1 → 1 (default band가 [0,1] 안)', () => {
    expect(cliff(0)).toBe(0);
    expect(cliff(1)).toBe(1);
  });

  test('[0,1] 밖 t도 band 밖이면 평탄하게 0/1을 반환한다', () => {
    expect(cliff(-5)).toBe(0);
    expect(cliff(5)).toBe(1);
  });

  test('width=0이면 RangeError를 던진다 (hard step 방지)', () => {
    expect(() => cliff(0.5, { width: 0 })).toThrow(RangeError);
  });

  test('음수 width는 RangeError를 던진다', () => {
    expect(() => cliff(0.5, { width: -0.1 })).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => cliff(value)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite threshold %s는 RangeError를 던진다', (value) => {
    expect(() => cliff(0.5, { threshold: value })).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite width %s는 RangeError를 던진다', (value) => {
    expect(() => cliff(0.5, { width: value })).toThrow(RangeError);
  });
});
