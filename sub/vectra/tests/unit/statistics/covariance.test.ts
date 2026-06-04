/**
 * statistics.covariance vector helper를 검증한다.
 * population/sample denominator, 기본 covariance case, validation, signed-zero canonicalize를 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { covariance } from '../../../src/statistics/covariance';

describe('covariance — population/sample denominator', () => {
  test('population denominator는 n', () => {
    // first=[1, 3], second=[2, 6]: meanX=2, meanY=4, productSum=(-1)(-2)+(1)(2)=4
    // population cov = 4/2 = 2
    expect(covariance([1, 3], [2, 6])).toBe(2);
    expect(covariance([1, 3], [2, 6], { mode: 'population' })).toBe(2);
  });

  test('sample denominator는 n - 1', () => {
    // productSum=4, sample cov = 4/1 = 4
    expect(covariance([1, 3], [2, 6], { mode: 'sample' })).toBe(4);
  });

  test('default mode는 population', () => {
    // first=[1, 2, 3, 4], second=[2, 4, 6, 8]: meanX=2.5, meanY=5
    // deltas=[-1.5, -0.5, 0.5, 1.5], [-3, -1, 1, 3]
    // productSum=4.5+0.5+0.5+4.5=10, population cov = 10/4 = 2.5
    expect(covariance([1, 2, 3, 4], [2, 4, 6, 8])).toBe(2.5);
  });
});

describe('covariance — basic case', () => {
  test('양의 covariance (선형 증가)', () => {
    // first=[1, 2, 3], second=[2, 4, 6]: meanX=2, meanY=4
    // productSum=(-1)(-2)+(0)(0)+(1)(2)=4, cov=4/3
    expect(covariance([1, 2, 3], [2, 4, 6])).toBeCloseTo(4 / 3, 12);
  });

  test('음의 covariance (선형 감소)', () => {
    // first=[1, 2, 3], second=[6, 4, 2]: meanX=2, meanY=4
    // productSum=(-1)(2)+(0)(0)+(1)(-2)=-4, cov=-4/3
    expect(covariance([1, 2, 3], [6, 4, 2])).toBeCloseTo(-4 / 3, 12);
  });

  test('동일 vector covariance는 variance와 같다', () => {
    // first=second=[1, 2, 3]: meanX=2, squaredSum=2, cov=2/3
    expect(covariance([1, 2, 3], [1, 2, 3])).toBeCloseTo(2 / 3, 12);
  });

  test('상수 vector covariance는 0', () => {
    // first=[5, 5, 5], second=[1, 2, 3]: deltaX=0 for all → productSum=0
    expect(covariance([5, 5, 5], [1, 2, 3])).toBe(0);
  });

  test('대칭 분포로 covariance가 정확히 0', () => {
    // first=[-1, 0, 1, 0], second=[0, 1, 0, -1]: meanX=0, meanY=0
    // productSum=(-1)(0)+(0)(1)+(1)(0)+(0)(-1)=0
    expect(covariance([-1, 0, 1, 0], [0, 1, 0, -1])).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// covariance — invalid input
// ---------------------------------------------------------------------------

describe('covariance — invalid input', () => {
  test('first가 non-array면 TypeError', () => {
    expect(() => covariance(null as unknown as readonly number[], [1])).toThrow(TypeError);
    expect(() => covariance('abc' as unknown as readonly number[], [1])).toThrow(TypeError);
  });

  test('second가 non-array면 TypeError', () => {
    expect(() => covariance([1], null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => covariance([1], undefined as unknown as readonly number[])).toThrow(TypeError);
  });

  test('길이가 다르면 RangeError', () => {
    expect(() => covariance([1, 2], [1, 2, 3])).toThrow(RangeError);
    expect(() => covariance([1, 2, 3], [1])).toThrow(RangeError);
  });

  test('빈 배열은 RangeError', () => {
    expect(() => covariance([], [])).toThrow(RangeError);
    expect(() => covariance([], [], { mode: 'sample' })).toThrow(RangeError);
  });

  test('sample mode에서 length === 1은 RangeError', () => {
    expect(() => covariance([1], [2], { mode: 'sample' })).toThrow(RangeError);
  });

  test('population mode에서 length === 1은 허용 (cov = 0)', () => {
    // 단일 entry: mean=value, delta=0 → productSum=0, cov=0/1=0
    expect(covariance([5], [7])).toBe(0);
  });

  test('invalid mode는 RangeError', () => {
    expect(() => covariance([1, 2], [3, 4], { mode: 'bad' as never })).toThrow(RangeError);
  });

  test('first에 NaN entry는 RangeError', () => {
    expect(() => covariance([1, Number.NaN], [3, 4])).toThrow(RangeError);
  });

  test('second에 NaN entry는 RangeError', () => {
    expect(() => covariance([1, 2], [3, Number.NaN])).toThrow(RangeError);
  });

  test('first에 Infinity entry는 RangeError', () => {
    expect(() => covariance([1, Number.POSITIVE_INFINITY], [3, 4])).toThrow(RangeError);
  });

  test('second에 -Infinity entry는 RangeError', () => {
    expect(() => covariance([1, 2], [3, Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });

  test('first sum overflow는 RangeError', () => {
    expect(() => covariance([Number.MAX_VALUE, Number.MAX_VALUE], [1, 2])).toThrow(RangeError);
  });

  test('second sum overflow는 RangeError', () => {
    expect(() => covariance([1, 2], [Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
  });

  test('squared delta overflow는 RangeError', () => {
    // sum=0 finite, mean=0, delta=±MAX_VALUE, dx*dx = Infinity → fail
    expect(() => covariance([Number.MAX_VALUE, -Number.MAX_VALUE], [1, -1])).toThrow(RangeError);
  });

  test('product overflow는 RangeError', () => {
    // first delta = ±MAX_VALUE/2, second delta = ±MAX_VALUE/2 → product = MAX_VALUE/2 * MAX_VALUE/2 = Infinity
    const half = Number.MAX_VALUE / 2;
    expect(() => covariance([half, -half], [half, -half])).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// covariance — signed zero
// ---------------------------------------------------------------------------

describe('covariance — signed zero', () => {
  test('한쪽 vector가 상수이고 다른 쪽이 가변이면 결과는 +0', () => {
    // first=[1, -1], second=[1, 1]: meanX=0, meanY=1. delta=[1, -1], [0, 0]. product=0+0=+0.
    // cov=0/2=+0. canonicalize 분기는 trigger하지 않지만 결과가 +0임을 보장.
    const result = covariance([1, -1], [1, 1]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('product가 -0 mix(0 * 음수)로 누적되어도 +0', () => {
    // first=[2, 2, 2], second=[3, 1, 2]: meanX=2, meanY=2. delta=[0,0,0], [1,-1,0].
    // product=[0*1, 0*-1, 0*0]=[+0, -0, +0]. JS는 (+0)+(-0)=+0이라 productSum은 +0.
    // canonicalize 분기는 dead path이지만 결과 contract(-0 노출 금지)는 그대로 보장.
    const result = covariance([2, 2, 2], [3, 1, 2]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});
