/**
 * calculus definite integral helper unit test.
 *
 * trapezoidalIntegral — linear/quadratic polynomial 정확도, binCount 2/N,
 *   invalid f/range/binCount(<2/NaN/non-integer/safe-integer 초과), non-finite f(x),
 *   누적 sum overflow(MAX_VALUE), 결과 signed-zero canonicalize, xMax - xMin overflow.
 * simpsonIntegral — linear/quadratic/cubic exactness, parity 위반(짝수 binCount),
 *   invalid f/range/binCount(<3/짝수 binCount/NaN/non-integer), non-finite f(x),
 *   누적 sum overflow, 결과 signed-zero canonicalize, xMax - xMin overflow.
 */

import { describe, expect, test, vi } from 'vitest';
import { simpsonIntegral } from '../../../src/calculus/simpson-integral';
import { trapezoidalIntegral } from '../../../src/calculus/trapezoidal-integral';

// ---------------------------------------------------------------------------
// trapezoidalIntegral — 정상 동작
// ---------------------------------------------------------------------------

describe('trapezoidalIntegral — 정상 동작', () => {
  test('상수 함수 f(x) = 5는 (xMax - xMin) * 5를 정확히 반환한다', () => {
    expect(trapezoidalIntegral(() => 5, 0, 2, 5)).toBe(10);
  });

  test('linear f(x) = 2x + 3은 trapezoidal에서 정확값 [x^2 + 3x]을 반환한다', () => {
    // ∫_0^4 (2x + 3) dx = 16 + 12 = 28. trapezoidal은 linear에 대해 정확.
    expect(trapezoidalIntegral((x) => 2 * x + 3, 0, 4, 5)).toBeCloseTo(28, 12);
  });

  test('quadratic f(x) = x^2는 trapezoidal에서 sample 수가 늘수록 정확값 (= 1/3)에 수렴한다', () => {
    // ∫_0^1 x^2 dx = 1/3 = 0.3333...
    const coarse = trapezoidalIntegral((x) => x * x, 0, 1, 5);
    const fine = trapezoidalIntegral((x) => x * x, 0, 1, 101);
    const exact = 1 / 3;
    expect(Math.abs(fine - exact)).toBeLessThan(Math.abs(coarse - exact));
    expect(fine).toBeCloseTo(exact, 4);
  });

  test('binCount 2(단일 interval)는 endpoint 두 sample의 평균 * (xMax - xMin)이다', () => {
    // f(x) = x: y = [0, 1], dx = 1 → 0.5 * 1 = 0.5
    expect(trapezoidalIntegral((x) => x, 0, 1, 2)).toBe(0.5);
  });

  test('endpoint sample은 xMin/xMax를 직접 평가한다(drift 회피)', () => {
    // [0.26, 2.81, n=3]은 0.26 + ((2.81-0.26)/2)*2 = 2.8099999999999996으로 drift한다.
    // 구현이 endpoint를 직접 평가하면 calls[1]은 정확히 2.81이어야 한다.
    const calls: number[] = [];
    const f = (x: number) => {
      calls.push(x);
      return 0;
    };
    trapezoidalIntegral(f, 0.26, 2.81, 3);
    expect(calls).toHaveLength(3);
    // 호출 순서: xMin, xMax, middle. 첫 두 호출은 endpoint를 직접 평가한다.
    expect(calls[0]).toBe(0.26);
    expect(calls[1]).toBe(2.81);
  });
});

// ---------------------------------------------------------------------------
// trapezoidalIntegral — invalid input은 throw한다
// ---------------------------------------------------------------------------

describe('trapezoidalIntegral — invalid input은 throw한다', () => {
  test('f가 function 아니면 TypeError이며 f를 호출하지 않는다', () => {
    expect(() => trapezoidalIntegral(undefined as unknown as (x: number) => number, 0, 1, 4)).toThrow(TypeError);
    expect(() => trapezoidalIntegral(null as unknown as (x: number) => number, 0, 1, 4)).toThrow(TypeError);
    expect(() => trapezoidalIntegral(42 as unknown as (x: number) => number, 0, 1, 4)).toThrow(TypeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('xMin %s는 RangeError', (xMin) => {
    expect(() => trapezoidalIntegral((x) => x, xMin, 1, 4)).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('xMax %s는 RangeError', (xMax) => {
    expect(() => trapezoidalIntegral((x) => x, 0, xMax, 4)).toThrow(RangeError);
  });

  test.each([
    -1,
    0,
    1,
    0.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
  ])('binCount %s는 RangeError', (binCount) => {
    expect(() => trapezoidalIntegral((x) => x, 0, 1, binCount)).toThrow(RangeError);
  });

  test('binCount 0/1에서도 f를 호출하지 않고 RangeError', () => {
    const f = vi.fn((x: number) => x);
    expect(() => trapezoidalIntegral(f, 0, 1, 0)).toThrow(RangeError);
    expect(() => trapezoidalIntegral(f, 0, 1, 1)).toThrow(RangeError);
    expect(f).not.toHaveBeenCalled();
  });

  test('xMin >= xMax는 RangeError', () => {
    expect(() => trapezoidalIntegral((x) => x, 1, 0, 4)).toThrow(RangeError);
    expect(() => trapezoidalIntegral((x) => x, 1, 1, 4)).toThrow(RangeError);
  });

  test('xMax - xMin overflow는 RangeError', () => {
    expect(() => trapezoidalIntegral((x) => x, -Number.MAX_VALUE, Number.MAX_VALUE, 4)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// trapezoidalIntegral — non-finite f(x)와 누적 overflow
// ---------------------------------------------------------------------------

describe('trapezoidalIntegral — non-finite f(x)는 RangeError', () => {
  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('f가 %s를 반환하면 RangeError', (bad) => {
    expect(() => trapezoidalIntegral(() => bad, 0, 1, 4)).toThrow(RangeError);
  });

  test('f가 일부 grid point에서만 non-finite를 반환해도 RangeError', () => {
    // 첫 호출은 xMin, 두 번째는 xMax(endpoint 직접 평가) — 두 endpoint는 모두 finite.
    // 그 이후 middle index 호출에서 NaN.
    let call = 0;
    const f = (x: number) => {
      call++;
      if (call <= 2) return x;
      return Number.NaN;
    };
    expect(() => trapezoidalIntegral(f, 0, 1, 5)).toThrow(RangeError);
  });
});

describe('trapezoidalIntegral — 누적 sum overflow는 RangeError', () => {
  test('endpoint pair 합산에서 Infinity가 되면 즉시 RangeError(middle 호출 없음)', () => {
    // (y0 + yLast) * 0.5 = (MAX + MAX) * 0.5 = Infinity → middle loop 진입 전 throw.
    const f = vi.fn(() => Number.MAX_VALUE);
    expect(() => trapezoidalIntegral(f, 0, 1, 5)).toThrow(RangeError);
    // xMin, xMax 두 endpoint만 평가하고 throw.
    expect(f).toHaveBeenCalledTimes(2);
  });

  test('middle index에서 누적 sum이 Infinity가 되면 RangeError', () => {
    // y0 = 0, yLast = 0, middle은 MAX를 반환. sum = 0 → i=1 sum += MAX = MAX(finite) →
    // i=2 sum += MAX = MAX + MAX = Infinity → throw.
    let call = 0;
    const f = vi.fn(() => {
      call++;
      if (call <= 2) return 0;
      return Number.MAX_VALUE;
    });
    expect(() => trapezoidalIntegral(f, 0, 1, 5)).toThrow(RangeError);
    // xMin, xMax, middle i=1, middle i=2까지 평가 후 throw.
    expect(f).toHaveBeenCalledTimes(4);
  });
});

describe('trapezoidalIntegral — 결과 signed-zero canonicalize', () => {
  test('대칭 sample의 적분이 -0이 되면 +0으로 canonicalize한다', () => {
    // f(x) = -0 상수. sum = -0 * 0.5 + -0 + -0 = -0. result = -0 * dx = -0 → canonicalize.
    const result = trapezoidalIntegral(() => -0, 0, 1, 5);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// simpsonIntegral — 정상 동작
// ---------------------------------------------------------------------------

describe('simpsonIntegral — 정상 동작 (exactness)', () => {
  test('상수 함수 f(x) = 5는 (xMax - xMin) * 5를 정확히 반환한다', () => {
    expect(simpsonIntegral(() => 5, 0, 2, 5)).toBeCloseTo(10, 12);
  });

  test('linear f(x) = 2x + 3은 simpson에서 정확값을 반환한다', () => {
    // ∫_0^4 (2x + 3) dx = 28.
    expect(simpsonIntegral((x) => 2 * x + 3, 0, 4, 5)).toBeCloseTo(28, 12);
  });

  test('quadratic f(x) = x^2은 simpson 1/3 rule에서 정확값을 반환한다', () => {
    // ∫_0^1 x^2 dx = 1/3.
    expect(simpsonIntegral((x) => x * x, 0, 1, 3)).toBeCloseTo(1 / 3, 12);
    expect(simpsonIntegral((x) => x * x, 0, 1, 5)).toBeCloseTo(1 / 3, 12);
  });

  test('cubic f(x) = x^3은 simpson 1/3 rule에서 정확값을 반환한다 (1/3 rule은 cubic까지 정확)', () => {
    // ∫_0^2 x^3 dx = 4.
    expect(simpsonIntegral((x) => x * x * x, 0, 2, 3)).toBeCloseTo(4, 10);
    expect(simpsonIntegral((x) => x * x * x, 0, 2, 5)).toBeCloseTo(4, 10);
  });

  test('quartic f(x) = x^4는 sample 수가 늘수록 정확값(= 1/5)에 수렴한다', () => {
    const exact = 1 / 5;
    const coarse = simpsonIntegral((x) => x * x * x * x, 0, 1, 5);
    const fine = simpsonIntegral((x) => x * x * x * x, 0, 1, 101);
    expect(Math.abs(fine - exact)).toBeLessThan(Math.abs(coarse - exact));
    expect(fine).toBeCloseTo(exact, 8);
  });

  test('endpoint sample은 xMin/xMax를 직접 평가한다(drift 회피)', () => {
    // [0.26, 2.81, n=3]은 drift 케이스(0.26 + ((2.81-0.26)/2)*2 = 2.8099999999999996).
    // 구현이 endpoint를 직접 평가하면 calls[1]은 정확히 2.81이어야 한다.
    const calls: number[] = [];
    const f = (x: number) => {
      calls.push(x);
      return 0;
    };
    simpsonIntegral(f, 0.26, 2.81, 3);
    expect(calls).toHaveLength(3);
    // 호출 순서: xMin, xMax, middle. 첫 두 호출은 endpoint를 직접 평가한다.
    expect(calls[0]).toBe(0.26);
    expect(calls[1]).toBe(2.81);
  });
});

// ---------------------------------------------------------------------------
// simpsonIntegral — invalid input은 throw한다
// ---------------------------------------------------------------------------

describe('simpsonIntegral — invalid input은 throw한다', () => {
  test('f가 function 아니면 TypeError이며 f를 호출하지 않는다', () => {
    expect(() => simpsonIntegral(undefined as unknown as (x: number) => number, 0, 1, 5)).toThrow(TypeError);
    expect(() => simpsonIntegral(null as unknown as (x: number) => number, 0, 1, 5)).toThrow(TypeError);
    expect(() => simpsonIntegral('foo' as unknown as (x: number) => number, 0, 1, 5)).toThrow(TypeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('xMin %s는 RangeError', (xMin) => {
    expect(() => simpsonIntegral((x) => x, xMin, 1, 5)).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('xMax %s는 RangeError', (xMax) => {
    expect(() => simpsonIntegral((x) => x, 0, xMax, 5)).toThrow(RangeError);
  });

  test.each([
    -1,
    0,
    1,
    2,
    0.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
  ])('binCount %s는 RangeError(<3 또는 invalid)', (binCount) => {
    expect(() => simpsonIntegral((x) => x, 0, 1, binCount)).toThrow(RangeError);
  });

  test.each([4, 6, 8, 100])('binCount %s는 (binCount - 1)이 홀수이므로 parity 위반 RangeError', (binCount) => {
    expect(() => simpsonIntegral((x) => x, 0, 1, binCount)).toThrow(RangeError);
  });

  test('parity 위반은 자동 보정하지 않고 명시적으로 throw한다 (f 미호출)', () => {
    const f = vi.fn((x: number) => x);
    expect(() => simpsonIntegral(f, 0, 1, 4)).toThrow(RangeError);
    expect(f).not.toHaveBeenCalled();
  });

  test('binCount 0/1/2에서도 f를 호출하지 않고 RangeError', () => {
    const f = vi.fn((x: number) => x);
    expect(() => simpsonIntegral(f, 0, 1, 0)).toThrow(RangeError);
    expect(() => simpsonIntegral(f, 0, 1, 1)).toThrow(RangeError);
    expect(() => simpsonIntegral(f, 0, 1, 2)).toThrow(RangeError);
    expect(f).not.toHaveBeenCalled();
  });

  test('xMin >= xMax는 RangeError', () => {
    expect(() => simpsonIntegral((x) => x, 1, 0, 5)).toThrow(RangeError);
    expect(() => simpsonIntegral((x) => x, 1, 1, 5)).toThrow(RangeError);
  });

  test('xMax - xMin overflow는 RangeError', () => {
    expect(() => simpsonIntegral((x) => x, -Number.MAX_VALUE, Number.MAX_VALUE, 5)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// simpsonIntegral — non-finite f(x)와 누적 overflow
// ---------------------------------------------------------------------------

describe('simpsonIntegral — non-finite f(x)는 RangeError', () => {
  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('f가 %s를 반환하면 RangeError', (bad) => {
    expect(() => simpsonIntegral(() => bad, 0, 1, 5)).toThrow(RangeError);
  });

  test('f가 일부 grid point에서만 non-finite를 반환해도 RangeError', () => {
    // 첫 호출은 xMin, 두 번째는 xMax(endpoint 직접 평가) — 둘 다 finite.
    // 그 이후 middle 호출에서 NaN.
    let call = 0;
    const f = (x: number) => {
      call++;
      if (call <= 2) return x;
      return Number.NaN;
    };
    expect(() => simpsonIntegral(f, 0, 1, 5)).toThrow(RangeError);
  });
});

describe('simpsonIntegral — 누적 sum overflow는 RangeError', () => {
  test('endpoint pair 합산에서 Infinity가 되면 즉시 RangeError(middle 호출 없음)', () => {
    // y0 + yLast = MAX + MAX = Infinity → middle loop 진입 전 throw.
    const f = vi.fn(() => Number.MAX_VALUE);
    expect(() => simpsonIntegral(f, 0, 1, 5)).toThrow(RangeError);
    expect(f).toHaveBeenCalledTimes(2);
  });

  test('middle weighted 누적에서 Infinity가 되면 RangeError', () => {
    // y0 = 0, yLast = 0, middle은 MAX → i=1 weighted sum = 0 + 4*MAX = Infinity → 첫 middle에서 throw.
    let call = 0;
    const f = vi.fn(() => {
      call++;
      if (call <= 2) return 0;
      return Number.MAX_VALUE;
    });
    expect(() => simpsonIntegral(f, 0, 1, 5)).toThrow(RangeError);
    // xMin, xMax, 첫 middle(i=1)까지 평가 후 throw.
    expect(f).toHaveBeenCalledTimes(3);
  });
});

describe('simpsonIntegral — 결과 signed-zero canonicalize', () => {
  test('대칭 sample의 적분이 -0이 되면 +0으로 canonicalize한다', () => {
    const result = simpsonIntegral(() => -0, 0, 1, 5);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});
