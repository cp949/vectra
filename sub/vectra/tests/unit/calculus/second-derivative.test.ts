/**
 * calculus second derivative helper unit test.
 *
 * secondDerivative(Into) — quadratic constant=2, cubic=6x, binCount 0/1/2 zero-operator,
 *   boundary shifted-stencil one-sided second-order fallback, invalid f/range/binCount,
 *   non-finite f(x), arithmetic overflow, signed-zero, atomicity.
 */

import { describe, expect, test, vi } from 'vitest';
import { secondDerivative } from '../../../src/calculus/second-derivative';
import { secondDerivativeInto } from '../../../src/calculus/second-derivative-into';

// ---------------------------------------------------------------------------
// secondDerivativeInto / secondDerivative — 정상 동작
// ---------------------------------------------------------------------------

describe('secondDerivativeInto — 정상 동작', () => {
  test('quadratic f(x) = x^2은 모든 grid에서 second derivative === 2', () => {
    // f''(x) = 2 정확. central second-difference도 2차 polynomial에 정확.
    const result = secondDerivativeInto([], (x) => x * x, 0, 4, 5);
    expect(result).toHaveLength(5);
    for (const v of result) {
      expect(v).toBeCloseTo(2, 10);
    }
  });

  test('quadratic f(x) = 3x^2 + 5x + 7도 모든 grid에서 6', () => {
    // f''(x) = 6 정확.
    const result = secondDerivativeInto([], (x) => 3 * x * x + 5 * x + 7, -2, 2, 7);
    expect(result).toHaveLength(7);
    for (const v of result) {
      expect(v).toBeCloseTo(6, 10);
    }
  });

  test('linear f(x) = 2x + 3은 모든 grid에서 second derivative === 0', () => {
    const result = secondDerivativeInto([], (x) => 2 * x + 3, 0, 4, 5);
    expect(result).toHaveLength(5);
    for (const v of result) {
      expect(v).toBeCloseTo(0, 10);
    }
  });

  test('cubic f(x) = x^3에서 boundary는 shifted stencil로 grid 위치의 f"(x) = 6x를 근사한다', () => {
    // f'(x) = 3x^2, f''(x) = 6x.
    // binCount=5, [0, 4], dx=1, y=[0, 1, 8, 27, 64].
    // i=0 shifted [0,1,2]: (0 - 2 + 8)/1 = 6 → f''(0)=0과 정확치 않음(2nd-order에서 cubic 미정확).
    //   사실 cubic의 second derivative는 central(O(dx^2))로 middle은 정확, boundary shifted는 cubic이라 1차
    //   leading error. 따라서 strict equality는 무리, monotonic 경향만 확인.
    const result = secondDerivativeInto([], (x) => x * x * x, 0, 4, 5);
    expect(result).toHaveLength(5);
    // middle row (i=1,2,3)은 central central second-difference에서 cubic 정확:
    //   i=1: (y[0]-2y[1]+y[2])/1 = (0-2+8)/1 = 6 = 6*x[1]=6
    //   i=2: (y[1]-2y[2]+y[3])/1 = (1-16+27)/1 = 12 = 6*x[2]=12
    //   i=3: (y[2]-2y[3]+y[4])/1 = (8-54+64)/1 = 18 = 6*x[3]=18
    expect(result[1]).toBeCloseTo(6, 10);
    expect(result[2]).toBeCloseTo(12, 10);
    expect(result[3]).toBeCloseTo(18, 10);
    // boundary는 shifted stencil로 인접 middle의 값과 같다(cubic에서):
    //   i=0 shifted [0,1,2]: 6 (= i=1 middle 값)
    //   i=4 shifted [2,3,4]: (8-54+64)/1 = 18 (= i=3 middle 값)
    expect(result[0]).toBeCloseTo(6, 10);
    expect(result[4]).toBeCloseTo(18, 10);
  });

  test('binCount === 3에서 모든 row가 같은 stencil [0,1,2]를 공유한다', () => {
    // [0, 2], dx=1, y=[0, 1, 4]. 모두 (0-2+4)/1 = 2.
    expect(secondDerivativeInto([], (x) => x * x, 0, 2, 3)).toEqual([2, 2, 2]);
  });

  test('endpoint sample은 xMin/xMax를 직접 평가한다(drift 회피)', () => {
    // drift 케이스 [0.26, 2.81, n=3]에서 xMin/xMax 직접 평가 보장.
    // secondDerivativeInto는 grid 순서(xMin → middle → xMax)로 평가하므로 첫 호출이 xMin,
    // 마지막 호출이 xMax여야 한다.
    const calls: number[] = [];
    const f = (x: number) => {
      calls.push(x);
      return x * x;
    };
    secondDerivativeInto([], f, 0.26, 2.81, 3);
    expect(calls).toHaveLength(3);
    expect(calls[0]).toBe(0.26);
    expect(calls[calls.length - 1]).toBe(2.81);
  });
});

describe('secondDerivative — companion은 새 배열을 반환한다', () => {
  test('quadratic', () => {
    const result = secondDerivative((x) => x * x, 0, 4, 5);
    expect(result).toHaveLength(5);
    for (const v of result) {
      expect(v).toBeCloseTo(2, 10);
    }
  });

  test('linear', () => {
    const result = secondDerivative((x) => 2 * x + 3, 0, 4, 5);
    for (const v of result) {
      expect(v).toBeCloseTo(0, 10);
    }
  });
});

// ---------------------------------------------------------------------------
// secondDerivativeInto — binCount 0/1/2 zero-operator fallback
// ---------------------------------------------------------------------------

describe('secondDerivativeInto — binCount 0/1/2 zero-operator fallback', () => {
  test('binCount 0은 [], f 미호출', () => {
    const f = vi.fn((x: number) => x * x);
    const out: number[] = [];
    const result = secondDerivativeInto(out, f, 0, 1, 0);
    expect(result).toBe(out);
    expect(out).toEqual([]);
    expect(f).not.toHaveBeenCalled();
  });

  test('binCount 1은 [0], f 미호출', () => {
    const f = vi.fn((x: number) => x * x);
    expect(secondDerivativeInto([], f, 5, 10, 1)).toEqual([0]);
    expect(f).not.toHaveBeenCalled();
  });

  test('binCount 2는 [0, 0], f 미호출', () => {
    const f = vi.fn((x: number) => x * x);
    expect(secondDerivativeInto([], f, 5, 10, 2)).toEqual([0, 0]);
    expect(f).not.toHaveBeenCalled();
  });

  test('binCount 0/1/2는 xMin >= xMax여도 throw하지 않는다(grid 불필요)', () => {
    expect(secondDerivativeInto([], (x) => x, 5, 5, 0)).toEqual([]);
    expect(secondDerivativeInto([], (x) => x, 5, 5, 1)).toEqual([0]);
    expect(secondDerivativeInto([], (x) => x, 5, 5, 2)).toEqual([0, 0]);
    expect(secondDerivativeInto([], (x) => x, 5, 0, 0)).toEqual([]);
    expect(secondDerivativeInto([], (x) => x, 5, 0, 2)).toEqual([0, 0]);
  });

  test('binCount 0/1/2는 기존 out entry를 truncate한다', () => {
    const out0: number[] = [99, 99, 99];
    secondDerivativeInto(out0, (x) => x, 0, 1, 0);
    expect(out0).toEqual([]);

    const out1: number[] = [99, 99, 99];
    secondDerivativeInto(out1, (x) => x, 0, 1, 1);
    expect(out1).toEqual([0]);

    const out2: number[] = [99, 99, 99];
    secondDerivativeInto(out2, (x) => x, 0, 1, 2);
    expect(out2).toEqual([0, 0]);
  });
});

// ---------------------------------------------------------------------------
// secondDerivativeInto — invalid input, atomicity
// ---------------------------------------------------------------------------

describe('secondDerivativeInto — invalid input은 throw하고 out 미수정', () => {
  test('f가 function 아니면 TypeError', () => {
    const out: number[] = [9, 9];
    expect(() => secondDerivativeInto(out, undefined as unknown as (x: number) => number, 0, 1, 5)).toThrow(TypeError);
    expect(out).toEqual([9, 9]);
    expect(() => secondDerivativeInto(out, null as unknown as (x: number) => number, 0, 1, 5)).toThrow(TypeError);
    expect(out).toEqual([9, 9]);
    expect(() => secondDerivativeInto(out, 42 as unknown as (x: number) => number, 0, 1, 5)).toThrow(TypeError);
    expect(out).toEqual([9, 9]);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('xMin %s는 RangeError', (xMin) => {
    const out: number[] = [9, 9];
    expect(() => secondDerivativeInto(out, (x) => x, xMin, 1, 5)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('xMax %s는 RangeError', (xMax) => {
    const out: number[] = [9, 9];
    expect(() => secondDerivativeInto(out, (x) => x, 0, xMax, 5)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('xMin >= xMax는 binCount >= 3에서 RangeError', () => {
    const out: number[] = [9, 9];
    expect(() => secondDerivativeInto(out, (x) => x, 1, 0, 5)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
    expect(() => secondDerivativeInto(out, (x) => x, 1, 1, 5)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test.each([-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'binCount %s는 RangeError',
    (binCount) => {
      const out: number[] = [9, 9];
      expect(() => secondDerivativeInto(out, (x) => x, 0, 1, binCount)).toThrow(RangeError);
      expect(out).toEqual([9, 9]);
    }
  );

  test('xMax - xMin overflow는 RangeError', () => {
    const out: number[] = [9, 9];
    expect(() => secondDerivativeInto(out, (x) => x, -Number.MAX_VALUE, Number.MAX_VALUE, 5)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });
});

describe('secondDerivativeInto — 성공 시 atomicity', () => {
  test('기존 entry를 target length로 truncate하고 같은 out을 반환한다', () => {
    const out: number[] = [99, 99, 99, 99, 99, 99];
    const result = secondDerivativeInto(out, (x) => x * x, 0, 4, 5);
    expect(result).toBe(out);
    for (const v of out) {
      expect(v).toBeCloseTo(2, 10);
    }
    expect(out).toHaveLength(5);
  });
});

describe('secondDerivative — invalid input은 throw한다', () => {
  test('f가 function 아니면 TypeError', () => {
    expect(() => secondDerivative(undefined as unknown as (x: number) => number, 0, 1, 5)).toThrow(TypeError);
  });

  test('xMin NaN은 RangeError', () => {
    expect(() => secondDerivative((x) => x, Number.NaN, 1, 5)).toThrow(RangeError);
  });

  test('binCount -1은 RangeError', () => {
    expect(() => secondDerivative((x) => x, 0, 1, -1)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// secondDerivativeInto — non-finite f(x)와 arithmetic overflow
// ---------------------------------------------------------------------------

describe('secondDerivativeInto — f(x) non-finite는 RangeError이고 out 미수정', () => {
  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('f가 %s를 반환하면 RangeError', (bad) => {
    const out: number[] = [9, 9];
    expect(() => secondDerivativeInto(out, () => bad, 0, 1, 5)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('f가 일부 grid point에서만 non-finite를 반환해도 RangeError', () => {
    const out: number[] = [9, 9];
    let call = 0;
    const f = (_x: number) => (call++ === 0 ? 0 : Number.NaN);
    expect(() => secondDerivativeInto(out, f, 0, 1, 5)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });
});

describe('secondDerivativeInto — arithmetic overflow는 RangeError이고 out 미수정', () => {
  test('numerator overflow(y[a] - 2*y[b] + y[c])는 RangeError', () => {
    // y = [MAX, 0, -MAX, 0, 0]. i=0 boundary stencil [0,1,2]: MAX - 0 + (-MAX) = 0.
    // i=1 middle [0,1,2]: 같음.
    // i=2 middle [1,2,3]: 0 - 2*(-MAX) + 0 = 2*MAX = Infinity → numerator overflow.
    const out: number[] = [9, 9];
    let call = 0;
    const values = [Number.MAX_VALUE, 0, -Number.MAX_VALUE, 0, 0];
    const f = (_x: number) => values[call++];
    expect(() => secondDerivativeInto(out, f, 0, 1, 5)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('boundary shifted stencil의 numerator overflow도 RangeError', () => {
    // y = [0, MAX, -MAX, 0, 0]에서 i=0 boundary [0,1,2]: 0 - 2*MAX + (-MAX) = -3*MAX = -Infinity.
    const out: number[] = [9, 9];
    let call = 0;
    const values = [0, Number.MAX_VALUE, -Number.MAX_VALUE, 0, 0];
    const f = (_x: number) => values[call++];
    expect(() => secondDerivativeInto(out, f, 0, 1, 5)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });
});

// ---------------------------------------------------------------------------
// secondDerivativeInto — signed-zero canonicalize
// ---------------------------------------------------------------------------

describe('secondDerivativeInto — signed-zero canonicalize', () => {
  test('linear f(x)=2x+3은 모든 entry가 +0이다(canonicalize)', () => {
    const result = secondDerivativeInto([], (x) => 2 * x + 3, 0, 4, 5);
    for (const v of result) {
      expect(Object.is(v, 0)).toBe(true);
    }
  });

  test('constant f = () => -0도 모든 entry가 +0이다(canonicalize)', () => {
    const result = secondDerivativeInto([], () => -0, 0, 1, 5);
    for (const v of result) {
      expect(Object.is(v, 0)).toBe(true);
    }
  });
});
