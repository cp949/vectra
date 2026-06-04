/**
 * easing Bezier/CSS preset 함수 단위 테스트.
 *
 * bezierScalar, quadraticBezier, cubicBezier, easeCss, easeInCss, easeOutCss, easeInOutCss
 */

import { describe, expect, test } from 'vitest';
import { bezierScalar } from '../../../src/easing/bezier-scalar';
import { easeCss, easeInCss, easeInOutCss, easeOutCss } from '../../../src/easing/css';
import { cubicBezier } from '../../../src/easing/cubic-bezier';
import { quadraticBezier } from '../../../src/easing/quadratic-bezier';

/** 비finite 입력 케이스 */
const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

// ─── bezierScalar ─────────────────────────────────────────────────────────────

describe('easing - bezierScalar', () => {
  test('단일 control은 해당 값을 반환한다', () => {
    expect(bezierScalar(0.5, [3])).toBe(3);
    expect(bezierScalar(0, [7])).toBe(7);
    expect(bezierScalar(1, [-2])).toBe(-2);
  });

  test('길이 2 controls는 선형 보간 결과를 반환한다', () => {
    expect(bezierScalar(0.5, [0, 1])).toBeCloseTo(0.5, 10);
    expect(bezierScalar(0, [0, 1])).toBeCloseTo(0, 10);
    expect(bezierScalar(1, [0, 1])).toBeCloseTo(1, 10);
    expect(bezierScalar(0.25, [0, 4])).toBeCloseTo(1, 10);
  });

  test('길이 3 controls 대표값', () => {
    // [0, 0.5, 1] at t=0.5: De Casteljau 2회 → 0.5
    expect(bezierScalar(0.5, [0, 0.5, 1])).toBeCloseTo(0.5, 10);
    // [0, 1, 0] at t=0.5: midpoint between 0 and 1 = 0.5, then between 0 and 0 = 0 → wait
    // step1: [0*(0.5) + 1*(0.5), 1*(0.5) + 0*(0.5)] = [0.5, 0.5]
    // step2: [0.5*(0.5) + 0.5*(0.5)] = [0.5]
    expect(bezierScalar(0.5, [0, 1, 0])).toBeCloseTo(0.5, 10);
  });

  test('길이 4 controls 대표값', () => {
    // [0, 0, 1, 1] at t=0.5 — cubic Bezier endpoint pair
    // 수식: 3*(1-t)^2*t*0 + 3*(1-t)*t^2*1 + t^3*1 = 3*0.25*0.5 + 0.125 = 0.375 + 0.125 = 0.5
    expect(bezierScalar(0.5, [0, 0, 1, 1])).toBeCloseTo(0.5, 10);
  });

  test('빈 배열은 RangeError를 던진다', () => {
    expect(() => bezierScalar(0.5, [])).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite control %s는 RangeError를 던진다', (value) => {
    expect(() => bezierScalar(0.5, [value])).toThrow(RangeError);
    expect(() => bezierScalar(0.5, [0, value, 1])).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => bezierScalar(value, [0, 1])).toThrow(RangeError);
  });

  test('원본 배열을 변경하지 않는다', () => {
    const controls = [0, 0.5, 1];
    const original = [...controls];
    bezierScalar(0.7, controls);
    expect(controls).toEqual(original);
  });
});

// ─── quadraticBezier ──────────────────────────────────────────────────────────

describe('easing - quadraticBezier', () => {
  test('endpoint t=0이면 정확히 0이다', () => {
    expect(quadraticBezier(0, 0.5)).toBe(0);
    expect(quadraticBezier(0, 1)).toBe(0);
    expect(quadraticBezier(0, -0.5)).toBe(0);
  });

  test('endpoint t=1이면 정확히 1이다', () => {
    expect(quadraticBezier(1, 0.5)).toBe(1);
    expect(quadraticBezier(1, 0)).toBe(1);
    expect(quadraticBezier(1, 2)).toBe(1);
  });

  test('control=1 t=0.5 대표값', () => {
    // [0, 1, 1] at t=0.5:
    // step1: [0.5, 1.0]
    // step2: [0.75]
    expect(quadraticBezier(0.5, 1)).toBeCloseTo(0.75, 10);
  });

  test('control=0.5 t=0.5이면 0.5에 가깝다', () => {
    // [0, 0.5, 1] at t=0.5:
    // step1: [0.25, 0.75]
    // step2: [0.5]
    expect(quadraticBezier(0.5, 0.5)).toBeCloseTo(0.5, 10);
  });

  test('수식 직접 대조: (1-t)^2*0 + 2*(1-t)*t*control + t^2*1', () => {
    const t = 0.3;
    const control = 0.8;
    const expected = 2 * (1 - t) * t * control + t * t;
    expect(quadraticBezier(t, control)).toBeCloseTo(expected, 10);
  });

  test.each(nonFiniteValues)('비finite control %s는 RangeError를 던진다', (value) => {
    expect(() => quadraticBezier(0.5, value)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => quadraticBezier(value, 0.5)).toThrow(RangeError);
  });
});

// ─── cubicBezier ──────────────────────────────────────────────────────────────

describe('easing - cubicBezier', () => {
  test('endpoint t=0이면 정확히 0이다 (tuple input)', () => {
    expect(cubicBezier(0, [0.25, 0.1], [0.25, 1])).toBe(0);
  });

  test('endpoint t=1이면 정확히 1이다 (tuple input)', () => {
    expect(cubicBezier(1, [0.25, 0.1], [0.25, 1])).toBe(1);
  });

  test('endpoint t=0이면 정확히 0이다 (object input)', () => {
    expect(cubicBezier(0, { x: 0.25, y: 0.1 }, { x: 0.25, y: 1 })).toBe(0);
  });

  test('endpoint t=1이면 정확히 1이다 (object input)', () => {
    expect(cubicBezier(1, { x: 0.25, y: 0.1 }, { x: 0.25, y: 1 })).toBe(1);
  });

  test('linear controls ([0,0],[1,1])은 identity에 가깝다', () => {
    const c1 = [0, 0] as const;
    const c2 = [1, 1] as const;
    // linear CSS cubic-bezier는 identity에 가까운 값
    expect(cubicBezier(0.25, c1, c2)).toBeCloseTo(0.25, 6);
    expect(cubicBezier(0.5, c1, c2)).toBeCloseTo(0.5, 6);
    expect(cubicBezier(0.75, c1, c2)).toBeCloseTo(0.75, 6);
  });

  test('tuple input과 object input은 동일한 결과를 반환한다', () => {
    const t = 0.5;
    const resultTuple = cubicBezier(t, [0.42, 0], [0.58, 1]);
    const resultObject = cubicBezier(t, { x: 0.42, y: 0 }, { x: 0.58, y: 1 });
    expect(resultTuple).toBeCloseTo(resultObject, 10);
  });

  test('x < 0이면 RangeError를 던진다', () => {
    expect(() => cubicBezier(0.5, [-0.1, 0], [0.5, 1])).toThrow(RangeError);
    expect(() => cubicBezier(0.5, [0.5, 0], [-0.1, 1])).toThrow(RangeError);
  });

  test('x > 1이면 RangeError를 던진다', () => {
    expect(() => cubicBezier(0.5, [1.1, 0], [0.5, 1])).toThrow(RangeError);
    expect(() => cubicBezier(0.5, [0.5, 0], [1.1, 1])).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite x1 %s는 RangeError를 던진다', (value) => {
    expect(() => cubicBezier(0.5, [value, 0], [0.5, 1])).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite y1 %s는 RangeError를 던진다', (value) => {
    expect(() => cubicBezier(0.5, [0.25, value], [0.25, 1])).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite x2 %s는 RangeError를 던진다', (value) => {
    expect(() => cubicBezier(0.5, [0.25, 0.1], [value, 1])).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite y2 %s는 RangeError를 던진다', (value) => {
    expect(() => cubicBezier(0.5, [0.25, 0.1], [0.25, value])).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => cubicBezier(value, [0.25, 0.1], [0.25, 1])).toThrow(RangeError);
  });

  test('ease CSS 대표값: t=0.5, cubicBezier([0.25,0.1],[0.25,1]) ≈ 알려진 값 범위', () => {
    // CSS ease preset: 0.25, 0.1, 0.25, 1
    // t=0.5일 때 y가 0보다 크고 1보다 작다
    const v = cubicBezier(0.5, [0.25, 0.1], [0.25, 1]);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(1);
  });
});

// ─── CSS preset ───────────────────────────────────────────────────────────────

describe('easing - easeCss', () => {
  test('endpoint t=0이면 정확히 0이다', () => {
    expect(easeCss(0)).toBe(0);
  });

  test('endpoint t=1이면 정확히 1이다', () => {
    expect(easeCss(1)).toBe(1);
  });

  test('t=0.5 대표값이 범위 내에 있다', () => {
    const v = easeCss(0.5);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(1);
  });

  test('easeCss(t)는 cubicBezier(t, [0.25, 0.1], [0.25, 1])과 같다', () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      expect(easeCss(t)).toBeCloseTo(cubicBezier(t, [0.25, 0.1], [0.25, 1]), 6);
    }
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => easeCss(value)).toThrow(RangeError);
  });
});

describe('easing - easeInCss', () => {
  test('endpoint t=0이면 정확히 0이다', () => {
    expect(easeInCss(0)).toBe(0);
  });

  test('endpoint t=1이면 정확히 1이다', () => {
    expect(easeInCss(1)).toBe(1);
  });

  test('초반 느리고 후반 빠른 곡선: t=0.5 < 0.5이다', () => {
    // ease-in은 천천히 시작 → 중간값이 선형보다 낮다
    expect(easeInCss(0.5)).toBeLessThan(0.5);
  });

  test('easeInCss(t)는 cubicBezier(t, [0.42, 0], [1, 1])과 같다', () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      expect(easeInCss(t)).toBeCloseTo(cubicBezier(t, [0.42, 0], [1, 1]), 6);
    }
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => easeInCss(value)).toThrow(RangeError);
  });
});

describe('easing - easeOutCss', () => {
  test('endpoint t=0이면 정확히 0이다', () => {
    expect(easeOutCss(0)).toBe(0);
  });

  test('endpoint t=1이면 정확히 1이다', () => {
    expect(easeOutCss(1)).toBe(1);
  });

  test('초반 빠르고 후반 느린 곡선: t=0.5 > 0.5이다', () => {
    // ease-out은 빠르게 시작 → 중간값이 선형보다 높다
    expect(easeOutCss(0.5)).toBeGreaterThan(0.5);
  });

  test('easeOutCss(t)는 cubicBezier(t, [0, 0], [0.58, 1])과 같다', () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      expect(easeOutCss(t)).toBeCloseTo(cubicBezier(t, [0, 0], [0.58, 1]), 6);
    }
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => easeOutCss(value)).toThrow(RangeError);
  });
});

describe('easing - easeInOutCss', () => {
  test('endpoint t=0이면 정확히 0이다', () => {
    expect(easeInOutCss(0)).toBe(0);
  });

  test('endpoint t=1이면 정확히 1이다', () => {
    expect(easeInOutCss(1)).toBe(1);
  });

  test('t=0.5에서 0.5에 가깝다 (대칭 곡선)', () => {
    // ease-in-out은 0.5에서 대칭
    expect(easeInOutCss(0.5)).toBeCloseTo(0.5, 3);
  });

  test('easeInOutCss(t)는 cubicBezier(t, [0.42, 0], [0.58, 1])과 같다', () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      expect(easeInOutCss(t)).toBeCloseTo(cubicBezier(t, [0.42, 0], [0.58, 1]), 6);
    }
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => easeInOutCss(value)).toThrow(RangeError);
  });
});
