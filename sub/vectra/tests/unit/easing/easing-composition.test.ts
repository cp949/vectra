/**
 * easing composition helper 단위 테스트.
 *
 * withMirror, withReverse, withInOut, withClamp01, easeBlend
 */

import { describe, expect, test } from 'vitest';
import { easeBlend } from '../../../src/easing/ease-blend';
import { withClamp01 } from '../../../src/easing/with-clamp01';
import { withInOut } from '../../../src/easing/with-in-out';
import { withMirror } from '../../../src/easing/with-mirror';
import { withReverse } from '../../../src/easing/with-reverse';

/** 비finite 입력 케이스 */
const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

/** fn 검증용 비function 케이스 */
const nonFunctionValues = [null, undefined, 'string', 42, true, {}, []];

// ─── withMirror ───────────────────────────────────────────────────────────────

describe('easing - withMirror', () => {
  test('수식 1 - fn(1 - t)를 계산한다', () => {
    const sq = (t: number) => t * t;
    const t = 0.3;
    // 1 - (1 - 0.3)^2 = 1 - 0.49 = 0.51
    expect(withMirror(sq, t)).toBeCloseTo(1 - sq(1 - t), 10);
  });

  test('identity fn으로 항등 확인: withMirror(t => t, 0.3) = 0.3', () => {
    const identity = (t: number) => t;
    // 1 - (1 - 0.3) = 0.3
    expect(withMirror(identity, 0.3)).toBeCloseTo(0.3, 10);
  });

  test('square fn: withMirror(t => t*t, 0.5) = 1 - 0.25 = 0.75', () => {
    const sq = (t: number) => t * t;
    expect(withMirror(sq, 0.5)).toBeCloseTo(0.75, 10);
  });

  test('endpoint t=0: withMirror(fn, 0) = 1 - fn(1)', () => {
    const sq = (t: number) => t * t;
    expect(withMirror(sq, 0)).toBeCloseTo(1 - sq(1), 10);
  });

  test('endpoint t=1: withMirror(fn, 1) = 1 - fn(0)', () => {
    const sq = (t: number) => t * t;
    expect(withMirror(sq, 1)).toBeCloseTo(1 - sq(0), 10);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => withMirror((t: number) => t, value)).toThrow(RangeError);
  });

  test.each(nonFunctionValues)('fn이 function이 아닌 %s이면 RangeError를 던진다', (value) => {
    expect(() => withMirror(value as unknown as (t: number) => number, 0.5)).toThrow(RangeError);
  });
});

// ─── withReverse ──────────────────────────────────────────────────────────────

describe('easing - withReverse', () => {
  test('수식 fn(1 - t)를 계산한다', () => {
    const sq = (t: number) => t * t;
    const t = 0.3;
    expect(withReverse(sq, t)).toBeCloseTo(sq(1 - t), 10);
  });

  test('identity fn: withReverse(t => t, 0.3) = 0.7', () => {
    const identity = (t: number) => t;
    expect(withReverse(identity, 0.3)).toBeCloseTo(0.7, 10);
  });

  test('square fn: withReverse(t => t*t, 0.5) = 0.25', () => {
    const sq = (t: number) => t * t;
    expect(withReverse(sq, 0.5)).toBeCloseTo(0.25, 10);
  });

  test('endpoint t=0: withReverse(fn, 0) = fn(1)', () => {
    const sq = (t: number) => t * t;
    expect(withReverse(sq, 0)).toBeCloseTo(sq(1), 10);
  });

  test('endpoint t=1: withReverse(fn, 1) = fn(0)', () => {
    const sq = (t: number) => t * t;
    expect(withReverse(sq, 1)).toBeCloseTo(sq(0), 10);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => withReverse((t: number) => t, value)).toThrow(RangeError);
  });

  test.each(nonFunctionValues)('fn이 function이 아닌 %s이면 RangeError를 던진다', (value) => {
    expect(() => withReverse(value as unknown as (t: number) => number, 0.5)).toThrow(RangeError);
  });
});

// ─── withInOut ────────────────────────────────────────────────────────────────

describe('easing - withInOut', () => {
  test('lower branch (t < 0.5): fn(2*t) / 2 수식을 따른다', () => {
    const sq = (t: number) => t * t;
    const t = 0.25;
    // sq(2 * 0.25) / 2 = sq(0.5) / 2 = 0.25 / 2 = 0.125
    expect(withInOut(sq, t)).toBeCloseTo(sq(2 * t) / 2, 10);
  });

  test('upper branch (t >= 0.5): 1 - fn(2 - 2*t) / 2 수식을 따른다', () => {
    const sq = (t: number) => t * t;
    const t = 0.75;
    // 1 - sq(2 - 1.5) / 2 = 1 - sq(0.5) / 2 = 1 - 0.125 = 0.875
    expect(withInOut(sq, t)).toBeCloseTo(1 - sq(2 - 2 * t) / 2, 10);
  });

  test('identity fn lower: withInOut(t => t, 0.25) = 0.25', () => {
    const identity = (t: number) => t;
    // fn(0.5) / 2 = 0.5 / 2 = 0.25
    expect(withInOut(identity, 0.25)).toBeCloseTo(0.25, 10);
  });

  test('identity fn upper: withInOut(t => t, 0.75) = 0.75', () => {
    const identity = (t: number) => t;
    // 1 - fn(0.5) / 2 = 1 - 0.25 = 0.75
    expect(withInOut(identity, 0.75)).toBeCloseTo(0.75, 10);
  });

  test('endpoint t=0: lower branch → fn(0) / 2', () => {
    const sq = (t: number) => t * t;
    // sq(0) / 2 = 0
    expect(withInOut(sq, 0)).toBeCloseTo(0, 10);
  });

  test('endpoint t=1: upper branch → 1 - fn(0) / 2', () => {
    const sq = (t: number) => t * t;
    // 1 - sq(0) / 2 = 1
    expect(withInOut(sq, 1)).toBeCloseTo(1, 10);
  });

  test('boundary t=0.5: upper branch → 1 - fn(1) / 2', () => {
    const sq = (t: number) => t * t;
    // 1 - sq(1) / 2 = 0.5
    expect(withInOut(sq, 0.5)).toBeCloseTo(0.5, 10);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => withInOut((t: number) => t, value)).toThrow(RangeError);
  });

  test.each(nonFunctionValues)('fn이 function이 아닌 %s이면 RangeError를 던진다', (value) => {
    expect(() => withInOut(value as unknown as (t: number) => number, 0.5)).toThrow(RangeError);
  });
});

// ─── withClamp01 ──────────────────────────────────────────────────────────────

describe('easing - withClamp01', () => {
  test('정상 범위 [0,1] 값은 그대로 반환한다', () => {
    expect(withClamp01(() => 0.5, 0)).toBeCloseTo(0.5, 10);
  });

  test('음수 결과는 0으로 clamp한다', () => {
    expect(withClamp01(() => -0.3, 0.5)).toBe(0);
  });

  test('1 초과 결과는 1로 clamp한다', () => {
    expect(withClamp01(() => 1.5, 0.5)).toBe(1);
  });

  test('정확히 0은 0을 반환한다', () => {
    expect(withClamp01(() => 0, 0.5)).toBe(0);
  });

  test('정확히 1은 1을 반환한다', () => {
    expect(withClamp01(() => 1, 0.5)).toBe(1);
  });

  test('fn(t)가 NaN이면 결과도 NaN이다', () => {
    const result = withClamp01(() => Number.NaN, 0.5);
    expect(Number.isNaN(result)).toBe(true);
  });

  test('t를 fn에 올바르게 전달한다', () => {
    const received: number[] = [];
    const fn = (t: number) => {
      received.push(t);
      return t;
    };
    withClamp01(fn, 0.7);
    expect(received).toEqual([0.7]);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => withClamp01((t: number) => t, value)).toThrow(RangeError);
  });

  test.each(nonFunctionValues)('fn이 function이 아닌 %s이면 RangeError를 던진다', (value) => {
    expect(() => withClamp01(value as unknown as (t: number) => number, 0.5)).toThrow(RangeError);
  });
});

// ─── easeBlend ────────────────────────────────────────────────────────────────

describe('easing - easeBlend', () => {
  const linear = (t: number) => t;
  const square = (t: number) => t * t;

  test('weight=0이면 a(t)를 반환한다', () => {
    expect(easeBlend(linear, square, 0, 0.5)).toBeCloseTo(0.5, 12);
  });

  test('weight=1이면 b(t)를 반환한다', () => {
    expect(easeBlend(linear, square, 1, 0.5)).toBeCloseTo(0.25, 12);
  });

  test('중간 weight는 선형 혼합값을 반환한다', () => {
    // 0.5 * 0.75 + 0.25 * 0.25 = 0.4375
    expect(easeBlend(linear, square, 0.25, 0.5)).toBeCloseTo(0.4375, 12);
  });

  test('weight를 clamp하지 않고 extrapolation을 허용한다', () => {
    // weight=-1: 0.5 * 2 + 0.25 * (-1) = 0.75
    expect(easeBlend(linear, square, -1, 0.5)).toBeCloseTo(0.75, 12);
    // weight=2: 0.5 * (-1) + 0.25 * 2 = 0
    expect(easeBlend(linear, square, 2, 0.5)).toBeCloseTo(0, 12);
  });

  test('두 callback 결과가 같으면 큰 extrapolation weight에서도 같은 값을 반환한다', () => {
    expect(
      easeBlend(
        () => 1,
        () => 1,
        Number.MAX_VALUE,
        0.5
      )
    ).toBe(1);
    expect(
      easeBlend(
        () => Number.MAX_VALUE,
        () => Number.MAX_VALUE,
        2,
        0.5
      )
    ).toBe(Number.MAX_VALUE);
  });

  test('weight endpoint에서는 signed zero를 해당 callback 결과대로 보존한다', () => {
    expect(
      Object.is(
        easeBlend(
          () => -0,
          () => 0,
          0,
          0.5
        ),
        -0
      )
    ).toBe(true);
    expect(
      Object.is(
        easeBlend(
          () => -0,
          () => 0,
          1,
          0.5
        ),
        0
      )
    ).toBe(true);
    expect(
      Object.is(
        easeBlend(
          () => 0,
          () => -0,
          1,
          0.5
        ),
        -0
      )
    ).toBe(true);
  });

  test('두 callback 모두 같은 t를 한 번씩 받는다', () => {
    const receivedA: number[] = [];
    const receivedB: number[] = [];
    const fnA = (t: number) => {
      receivedA.push(t);
      return t;
    };
    const fnB = (t: number) => {
      receivedB.push(t);
      return t;
    };
    easeBlend(fnA, fnB, 0.5, 0.3);
    expect(receivedA).toEqual([0.3]);
    expect(receivedB).toEqual([0.3]);
  });

  test.each(nonFunctionValues)('a가 function이 아닌 %s이면 RangeError를 던진다', (value) => {
    expect(() => easeBlend(value as unknown as (t: number) => number, square, 0.5, 0.5)).toThrow(RangeError);
  });

  test.each(nonFunctionValues)('b가 function이 아닌 %s이면 RangeError를 던진다', (value) => {
    expect(() => easeBlend(linear, value as unknown as (t: number) => number, 0.5, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite weight %s는 RangeError를 던진다', (value) => {
    expect(() => easeBlend(linear, square, value, 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => easeBlend(linear, square, 0.5, value)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('callback 결과가 비finite %s이면 RangeError를 던진다', (value) => {
    expect(() => easeBlend(() => value, square, 0.5, 0.5)).toThrow(RangeError);
    expect(() => easeBlend(linear, () => value, 0.5, 0.5)).toThrow(RangeError);
  });

  test('blend 결과가 overflow로 비finite이면 RangeError를 던진다', () => {
    expect(() =>
      easeBlend(
        () => Number.MAX_VALUE,
        () => -Number.MAX_VALUE,
        -1,
        0.5
      )
    ).toThrow(RangeError);
  });
});
