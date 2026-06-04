import { describe, expect, test } from 'vitest';
import { backIn, backInOut, backOut } from '../../../src/easing/back';
import { bounceIn, bounceInOut, bounceOut } from '../../../src/easing/bounce';
import { elasticIn, elasticInOut, elasticOut } from '../../../src/easing/elastic';
import { nonFiniteValues } from './easing-test-helpers';

describe('easing - backIn', () => {
  test('기본 overshoot에서 endpoint가 정확히 0과 1이다', () => {
    expect(backIn(0)).toEqual(0);
    expect(backIn(1)).toEqual(1);
  });

  test('기본 overshoot 대표 값이 수식과 일치한다', () => {
    const s = 1.70158;
    const t = 0.5;
    expect(backIn(t)).toBe(t * t * ((s + 1) * t - s));
  });

  test('custom overshoot으로 계산한다', () => {
    const s = 2.5;
    const t = 0.4;
    expect(backIn(t, s)).toBe(t * t * ((s + 1) * t - s));
  });

  test('음수 overshoot은 허용한다', () => {
    expect(() => backIn(0.5, -1)).not.toThrow();
    const s = -1;
    const t = 0.5;
    expect(backIn(t, s)).toBe(t * t * ((s + 1) * t - s));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => backIn(value)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite overshoot %s는 RangeError를 던진다', (value) => {
    expect(() => backIn(0.5, value)).toThrow(RangeError);
  });
});

describe('easing - backOut', () => {
  test('기본 overshoot에서 endpoint가 정확히 0과 1이다', () => {
    expect(backOut(0)).toEqual(0);
    expect(backOut(1)).toEqual(1);
  });

  test('기본 overshoot 대표 값이 수식과 일치한다', () => {
    const s = 1.70158;
    const t = 0.5;
    const u = t - 1;
    expect(backOut(t)).toBe(u * u * ((s + 1) * u + s) + 1);
  });

  test('custom overshoot으로 계산한다', () => {
    const s = 3;
    const t = 0.7;
    const u = t - 1;
    expect(backOut(t, s)).toBe(u * u * ((s + 1) * u + s) + 1);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => backOut(value)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite overshoot %s는 RangeError를 던진다', (value) => {
    expect(() => backOut(0.5, value)).toThrow(RangeError);
  });
});

describe('easing - backInOut', () => {
  test('기본 overshoot에서 endpoint가 정확히 0과 1이다', () => {
    expect(backInOut(0)).toEqual(0);
    expect(backInOut(1)).toEqual(1);
  });

  test('t < 0.5 구간에서 수식과 일치한다', () => {
    const s = 1.70158 * 1.525;
    const t = 0.3;
    const u = 2 * t;
    expect(backInOut(t)).toBe((u * u * ((s + 1) * u - s)) / 2);
  });

  test('t >= 0.5 구간에서 수식과 일치한다', () => {
    const s = 1.70158 * 1.525;
    const t = 0.7;
    const u = 2 * t - 2;
    expect(backInOut(t)).toBe((u * u * ((s + 1) * u + s) + 2) / 2);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => backInOut(value)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite overshoot %s는 RangeError를 던진다', (value) => {
    expect(() => backInOut(0.5, value)).toThrow(RangeError);
  });
});

describe('easing - bounceOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(bounceOut(0)).toEqual(0);
    expect(bounceOut(1)).toEqual(1);
  });

  test('첫 번째 piecewise 구간 (t < 1/2.75) 대표값이 수식과 일치한다', () => {
    // t = 0.2: 1/2.75 ~= 0.3636이므로 첫 번째 구간
    const t = 0.2;
    expect(bounceOut(t)).toBe(7.5625 * t * t);
  });

  test('두 번째 piecewise 구간 (t < 2/2.75) 대표값이 수식과 일치한다', () => {
    // t = 0.5: 1/2.75 < 0.5 < 2/2.75 ~= 0.7272
    const t = 0.5;
    const u = t - 1.5 / 2.75;
    expect(bounceOut(t)).toBe(7.5625 * u * u + 0.75);
  });

  test('세 번째 piecewise 구간 (t < 2.5/2.75) 대표값이 수식과 일치한다', () => {
    // t = 0.82: 2/2.75 < 0.82 < 2.5/2.75 ~= 0.9090
    const t = 0.82;
    const u = t - 2.25 / 2.75;
    expect(bounceOut(t)).toBe(7.5625 * u * u + 0.9375);
  });

  test('네 번째 piecewise 구간 대표값이 수식과 일치한다', () => {
    // t = 0.95: 2.5/2.75 < 0.95
    const t = 0.95;
    const u = t - 2.625 / 2.75;
    expect(bounceOut(t)).toBe(7.5625 * u * u + 0.984375);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => bounceOut(value)).toThrow(RangeError);
  });
});

describe('easing - bounceIn', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(bounceIn(0)).toEqual(0);
    expect(bounceIn(1)).toEqual(1);
  });

  test('1 - bounceOut(1 - t)와 동일하다', () => {
    // float64 연산 순서 차이로 인한 ulp 오차가 있을 수 있어 closeTo로 검증한다
    expect(bounceIn(0.3)).toBeCloseTo(1 - bounceOut(0.7), 12);
    expect(bounceIn(0.5)).toBeCloseTo(1 - bounceOut(0.5), 12);
    expect(bounceIn(0.7)).toBeCloseTo(1 - bounceOut(0.3), 12);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => bounceIn(value)).toThrow(RangeError);
  });
});

describe('easing - bounceInOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(bounceInOut(0)).toEqual(0);
    expect(bounceInOut(1)).toEqual(1);
  });

  test('t < 0.5 구간이 수식과 일치한다', () => {
    const t = 0.3;
    expect(bounceInOut(t)).toBe((1 - bounceOut(1 - 2 * t)) / 2);
  });

  test('t >= 0.5 구간이 수식과 일치한다', () => {
    const t = 0.7;
    expect(bounceInOut(t)).toBe((1 + bounceOut(2 * t - 1)) / 2);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => bounceInOut(value)).toThrow(RangeError);
  });
});

describe('easing - elasticIn', () => {
  test('t === 0에서 정확히 0을 반환한다', () => {
    expect(elasticIn(0)).toEqual(0);
  });

  test('t === 1에서 정확히 1을 반환한다', () => {
    expect(elasticIn(1)).toEqual(1);
  });

  test('기본 파라미터 대표값이 수식과 일치한다', () => {
    const amp = 1;
    const period = 0.3;
    const s = (period / (2 * Math.PI)) * Math.asin(1 / amp);
    const t = 0.5;
    const expected = -(amp * 2 ** (10 * (t - 1)) * Math.sin(((t - 1 - s) * (2 * Math.PI)) / period));
    expect(elasticIn(t)).toBeCloseTo(expected, 10);
  });

  test('custom amplitude와 period로 계산한다', () => {
    const amp = 1.5;
    const period = 0.4;
    const s = (period / (2 * Math.PI)) * Math.asin(1 / amp);
    const t = 0.6;
    const expected = -(amp * 2 ** (10 * (t - 1)) * Math.sin(((t - 1 - s) * (2 * Math.PI)) / period));
    expect(elasticIn(t, amp, period)).toBeCloseTo(expected, 10);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => elasticIn(value)).toThrow(RangeError);
  });

  test('amplitude < 1은 RangeError를 던진다', () => {
    expect(() => elasticIn(0.5, 0.9)).toThrow(RangeError);
    expect(() => elasticIn(0.5, 0)).toThrow(RangeError);
    expect(() => elasticIn(0.5, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite amplitude %s는 RangeError를 던진다', (value) => {
    expect(() => elasticIn(0.5, value)).toThrow(RangeError);
  });

  test('period <= 0은 RangeError를 던진다', () => {
    expect(() => elasticIn(0.5, 1, 0)).toThrow(RangeError);
    expect(() => elasticIn(0.5, 1, -0.1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite period %s는 RangeError를 던진다', (value) => {
    expect(() => elasticIn(0.5, 1, value)).toThrow(RangeError);
  });
});

describe('easing - elasticOut', () => {
  test('t === 0에서 정확히 0을 반환한다', () => {
    expect(elasticOut(0)).toEqual(0);
  });

  test('t === 1에서 정확히 1을 반환한다', () => {
    expect(elasticOut(1)).toEqual(1);
  });

  test('기본 파라미터 대표값이 수식과 일치한다', () => {
    const amp = 1;
    const period = 0.3;
    const s = (period / (2 * Math.PI)) * Math.asin(1 / amp);
    const t = 0.5;
    const expected = amp * 2 ** (-10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / period) + 1;
    expect(elasticOut(t)).toBeCloseTo(expected, 10);
  });

  test('custom amplitude와 period로 계산한다', () => {
    const amp = 2;
    const period = 0.5;
    const s = (period / (2 * Math.PI)) * Math.asin(1 / amp);
    const t = 0.4;
    const expected = amp * 2 ** (-10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / period) + 1;
    expect(elasticOut(t, amp, period)).toBeCloseTo(expected, 10);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => elasticOut(value)).toThrow(RangeError);
  });

  test('amplitude < 1은 RangeError를 던진다', () => {
    expect(() => elasticOut(0.5, 0.5)).toThrow(RangeError);
  });

  test('period <= 0은 RangeError를 던진다', () => {
    expect(() => elasticOut(0.5, 1, 0)).toThrow(RangeError);
    expect(() => elasticOut(0.5, 1, -1)).toThrow(RangeError);
  });
});

describe('easing - elasticInOut', () => {
  test('t === 0에서 정확히 0을 반환한다', () => {
    expect(elasticInOut(0)).toEqual(0);
  });

  test('t === 1에서 정확히 1을 반환한다', () => {
    expect(elasticInOut(1)).toEqual(1);
  });

  test('t < 0.5 구간이 수식과 일치한다', () => {
    const amp = 1;
    const period = 0.3;
    const p = period * 1.5;
    const s = (p / (2 * Math.PI)) * Math.asin(1 / amp);
    const t = 0.3;
    const expected = -(amp * 2 ** (10 * (2 * t - 1) - 1) * Math.sin(((2 * t - 1 - s) * (2 * Math.PI)) / p));
    expect(elasticInOut(t)).toBeCloseTo(expected, 10);
  });

  test('t >= 0.5 구간이 올바른 수식과 일치한다', () => {
    const amp = 1;
    const period = 0.3;
    const p = period * 1.5;
    const s = (p / (2 * Math.PI)) * Math.asin(1 / amp);
    const t = 0.7;
    const expected = (amp * 2 ** (-10 * (2 * t - 1)) * Math.sin(((2 * t - 1 - s) * (2 * Math.PI)) / p)) / 2 + 1;
    expect(elasticInOut(t)).toBeCloseTo(expected, 10);
  });

  test('t = 0.5에서 연속적으로 0.5를 반환한다', () => {
    expect(elasticInOut(0.5)).toBeCloseTo(0.5, 10);
  });

  test('대칭성: elasticInOut(t) + elasticInOut(1 - t) === 1', () => {
    for (const t of [0.6, 0.7, 0.75, 0.8, 0.9]) {
      expect(elasticInOut(t) + elasticInOut(1 - t)).toBeCloseTo(1, 10);
    }
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => elasticInOut(value)).toThrow(RangeError);
  });

  test('amplitude < 1은 RangeError를 던진다', () => {
    expect(() => elasticInOut(0.5, 0.9)).toThrow(RangeError);
  });

  test('period <= 0은 RangeError를 던진다', () => {
    expect(() => elasticInOut(0.5, 1, 0)).toThrow(RangeError);
  });
});
