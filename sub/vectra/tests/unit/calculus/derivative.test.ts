/**
 * calculus sampled derivative helper unit test.
 *
 * derivative(Into) — binCount 0/1/2+, method forward/backward/central(default),
 *   boundary fallback(첫/마지막 row one-sided), invalid f/method/range/count,
 *   non-finite f(x) (NaN/Infinity/-Infinity), arithmetic overflow(subtraction Infinity),
 *   signed zero canonicalize, `out` atomicity(success truncate / failure preserve).
 */

import { describe, expect, test, vi } from 'vitest';
import { derivative } from '../../../src/calculus/derivative';
import { derivativeInto } from '../../../src/calculus/derivative-into';

// ---------------------------------------------------------------------------
// derivativeInto / derivative — forward method
// ---------------------------------------------------------------------------

describe('derivativeInto — forward 차분 (Into)', () => {
  test('linear f(x) = 2x + 3은 모든 entry가 2다 (boundary 포함)', () => {
    const out: number[] = [];
    const result = derivativeInto(out, (x) => 2 * x + 3, 0, 3, 4, { method: 'forward' });
    expect(result).toBe(out);
    expect(out).toEqual([2, 2, 2, 2]);
  });

  test('quadratic f(x) = x^2은 forward 정의대로 [1, 3, 5] + boundary fallback', () => {
    expect(derivativeInto([], (x) => x * x, 0, 3, 4, { method: 'forward' })).toEqual([1, 3, 5, 5]);
  });

  test('binCount 2는 forward와 boundary fallback이 같은 결과를 만든다', () => {
    // dx = 1, y = [3, 5]. forward i=0: y[1]-y[0]=2. boundary i=1: same.
    expect(derivativeInto([], (x) => 2 * x + 3, 0, 1, 2, { method: 'forward' })).toEqual([2, 2]);
  });
});

// ---------------------------------------------------------------------------
// derivativeInto / derivative — backward method
// ---------------------------------------------------------------------------

describe('derivativeInto — backward 차분 (Into)', () => {
  test('linear f(x) = 2x + 3은 모든 entry가 2다 (boundary 포함)', () => {
    expect(derivativeInto([], (x) => 2 * x + 3, 0, 3, 4, { method: 'backward' })).toEqual([2, 2, 2, 2]);
  });

  test('quadratic f(x) = x^2은 boundary fallback + backward 정의대로 [1, 1, 3, 5]', () => {
    expect(derivativeInto([], (x) => x * x, 0, 3, 4, { method: 'backward' })).toEqual([1, 1, 3, 5]);
  });

  test('binCount 2는 backward와 boundary fallback이 같은 결과를 만든다', () => {
    // dx = 1, y = [3, 5]. boundary i=0: y[1]-y[0]=2. backward i=1: y[1]-y[0]=2.
    expect(derivativeInto([], (x) => 2 * x + 3, 0, 1, 2, { method: 'backward' })).toEqual([2, 2]);
  });
});

// ---------------------------------------------------------------------------
// degenerate binCount — 0 / 1
// ---------------------------------------------------------------------------

describe('derivativeInto — binCount 0/1 degenerate', () => {
  test('binCount 0은 빈 sequence를 반환하고 f를 호출하지 않는다 (모든 method)', () => {
    for (const method of ['forward', 'backward', 'central'] as const) {
      const f = vi.fn((x: number) => x);
      const out: number[] = [];
      const result = derivativeInto(out, f, 0, 1, 0, { method });
      expect(result).toBe(out);
      expect(out).toEqual([]);
      expect(f).not.toHaveBeenCalled();
    }
  });

  test('binCount 1은 [0]을 반환하고 f를 호출하지 않는다 (모든 method)', () => {
    for (const method of ['forward', 'backward', 'central'] as const) {
      const f = vi.fn((x: number) => x);
      const out: number[] = [];
      const result = derivativeInto(out, f, 5, 10, 1, { method });
      expect(result).toBe(out);
      expect(out).toEqual([0]);
      expect(f).not.toHaveBeenCalled();
    }
  });

  test('binCount 0/1은 xMin >= xMax여도 throw하지 않는다 (grid 불필요)', () => {
    expect(derivativeInto([], (x) => x, 5, 5, 0)).toEqual([]);
    expect(derivativeInto([], (x) => x, 5, 5, 1)).toEqual([0]);
    expect(derivativeInto([], (x) => x, 5, 0, 0)).toEqual([]);
    expect(derivativeInto([], (x) => x, 5, 0, 1)).toEqual([0]);
  });

  test('binCount 0/1은 기존 out entry를 truncate한다', () => {
    const out0: number[] = [99, 99, 99];
    derivativeInto(out0, (x) => x, 0, 1, 0);
    expect(out0).toEqual([]);

    const out1: number[] = [99, 99, 99];
    derivativeInto(out1, (x) => x, 0, 1, 1);
    expect(out1).toEqual([0]);
  });
});

// ---------------------------------------------------------------------------
// invalid input — TypeError / RangeError, out atomicity
// ---------------------------------------------------------------------------

describe('derivativeInto — invalid input은 throw하고 out을 수정하지 않는다', () => {
  test('f가 function 아니면 TypeError', () => {
    const out: number[] = [9, 9];
    expect(() => derivativeInto(out, undefined as unknown as (x: number) => number, 0, 1, 4)).toThrow(TypeError);
    expect(out).toEqual([9, 9]);
    expect(() => derivativeInto(out, null as unknown as (x: number) => number, 0, 1, 4)).toThrow(TypeError);
    expect(out).toEqual([9, 9]);
    expect(() => derivativeInto(out, 42 as unknown as (x: number) => number, 0, 1, 4)).toThrow(TypeError);
    expect(out).toEqual([9, 9]);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('xMin %s는 RangeError', (xMin) => {
    const out: number[] = [9, 9];
    expect(() => derivativeInto(out, (x) => x, xMin, 1, 4)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('xMax %s는 RangeError', (xMax) => {
    const out: number[] = [9, 9];
    expect(() => derivativeInto(out, (x) => x, 0, xMax, 4)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('xMin >= xMax는 binCount >= 2에서 RangeError', () => {
    const out: number[] = [9, 9];
    expect(() => derivativeInto(out, (x) => x, 1, 0, 4)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
    expect(() => derivativeInto(out, (x) => x, 1, 1, 4)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test.each([-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'binCount %s는 RangeError',
    (binCount) => {
      const out: number[] = [9, 9];
      expect(() => derivativeInto(out, (x) => x, 0, 1, binCount)).toThrow(RangeError);
      expect(out).toEqual([9, 9]);
    }
  );

  test('invalid method는 RangeError이며 binCount 0/1에서도 method 검증이 먼저 실행된다', () => {
    const out: number[] = [9, 9];
    expect(() => derivativeInto(out, (x) => x, 0, 1, 4, { method: 'middle' as unknown as 'central' })).toThrow(
      RangeError
    );
    expect(out).toEqual([9, 9]);

    // binCount 0/1에서도 invalid method는 throw해야 한다 (early return 전 검증).
    expect(() => derivativeInto(out, (x) => x, 0, 1, 0, { method: 'middle' as unknown as 'central' })).toThrow(
      RangeError
    );
    expect(out).toEqual([9, 9]);

    expect(() => derivativeInto(out, (x) => x, 0, 1, 1, { method: 'middle' as unknown as 'central' })).toThrow(
      RangeError
    );
    expect(out).toEqual([9, 9]);
  });

  test('xMax - xMin overflow는 RangeError이며 out을 수정하지 않는다', () => {
    const out: number[] = [9, 9];
    expect(() => derivativeInto(out, (x) => x, -Number.MAX_VALUE, Number.MAX_VALUE, 4)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });
});

// ---------------------------------------------------------------------------
// 성공 시 out atomicity
// ---------------------------------------------------------------------------

describe('derivativeInto — 성공 시 out atomicity', () => {
  test('기존 entry를 target length로 truncate하고 같은 out을 반환한다', () => {
    const out: number[] = [99, 99, 99, 99, 99, 99];
    const result = derivativeInto(out, (x) => 2 * x + 3, 0, 3, 4, { method: 'forward' });
    expect(result).toBe(out);
    expect(out).toEqual([2, 2, 2, 2]);
    expect(out).toHaveLength(4);
  });
});

describe('derivative — invalid input은 throw한다 (companion 대표)', () => {
  test('f가 function 아니면 TypeError', () => {
    expect(() => derivative(undefined as unknown as (x: number) => number, 0, 1, 4)).toThrow(TypeError);
  });
});

// ---------------------------------------------------------------------------
// derivativeInto / derivative — central method (default)
// ---------------------------------------------------------------------------

describe('derivativeInto — central 차분 (Into, default)', () => {
  test('options 생략은 central method와 같은 결과를 만든다', () => {
    const defaultResult = derivativeInto([], (x) => x * x, 0, 4, 5);
    const explicitResult = derivativeInto([], (x) => x * x, 0, 4, 5, { method: 'central' });
    expect(defaultResult).toEqual(explicitResult);
    expect(defaultResult).toEqual([1, 2, 4, 6, 7]);
  });

  test('quadratic f(x) = x^2은 central 정의대로 [1, 2, 4, 6, 7]', () => {
    // dx = 1, y = [0, 1, 4, 9, 16].
    // i=0 boundary: (y[1]-y[0])/dx = 1.
    // i=1 middle: (y[2]-y[0])/(2*dx) = 2.
    // i=2 middle: (y[3]-y[1])/(2*dx) = 4.
    // i=3 middle: (y[4]-y[2])/(2*dx) = 6.
    // i=4 boundary: (y[4]-y[3])/dx = 7.
    expect(derivativeInto([], (x) => x * x, 0, 4, 5, { method: 'central' })).toEqual([1, 2, 4, 6, 7]);
  });

  test('linear f(x) = 2x + 3은 central에서도 모든 entry가 2', () => {
    expect(derivativeInto([], (x) => 2 * x + 3, 0, 4, 5, { method: 'central' })).toEqual([2, 2, 2, 2, 2]);
  });

  test('binCount 2 central은 boundary fallback만 사용해 [d, d] one-sided 결과', () => {
    // dx = 1, y = [3, 5]. i=0 forward fallback, i=1 backward fallback. 둘 다 (5-3)/1 = 2.
    expect(derivativeInto([], (x) => 2 * x + 3, 0, 1, 2, { method: 'central' })).toEqual([2, 2]);

    // quadratic, binCount 2: y = [0, 1]. 둘 다 (1-0)/1 = 1.
    expect(derivativeInto([], (x) => x * x, 0, 1, 2, { method: 'central' })).toEqual([1, 1]);
  });

  test('binCount 3 central에서 middle row와 boundary fallback이 함께 동작한다', () => {
    // dx = 1, y = [0, 1, 4]. i=0 boundary (1-0)/1=1. i=1 middle (4-0)/2=2. i=2 boundary (4-1)/1=3.
    expect(derivativeInto([], (x) => x * x, 0, 2, 3, { method: 'central' })).toEqual([1, 2, 3]);
  });

  test('non-integer dx에서도 central 정의가 유지된다 (toBeCloseTo로 float drift 허용)', () => {
    // f(x) = sin(x) on [0, π], binCount 5 → dx = π/4.
    // central middle은 (sin(x[i+1]) - sin(x[i-1])) / (2*dx).
    const result = derivativeInto([], Math.sin, 0, Math.PI, 5, { method: 'central' });
    // i=0 boundary: (sin(π/4) - sin(0)) / (π/4) ≈ 0.9003
    // i=2 middle: (sin(3π/4) - sin(π/4)) / (π/2) = 0 (대칭).
    expect(result).toHaveLength(5);
    expect(result[2]).toBeCloseTo(0, 10);
    expect(result[0]).toBeCloseTo(Math.sin(Math.PI / 4) / (Math.PI / 4), 10);
    expect(result[4]).toBeCloseTo((Math.sin(Math.PI) - Math.sin((3 * Math.PI) / 4)) / (Math.PI / 4), 10);
  });
});

describe('derivative — companion (default + method 전달)', () => {
  test('options 생략은 central default로 동작하고 새 배열을 반환한다', () => {
    const out = derivative((x) => x * x, 0, 4, 5);
    expect(out).toEqual([1, 2, 4, 6, 7]);
    expect(Array.isArray(out)).toBe(true);
  });

  test('method option이 derivativeInto로 전달된다 (forward)', () => {
    expect(derivative((x) => x * x, 0, 3, 4, { method: 'forward' })).toEqual([1, 3, 5, 5]);
  });
});

// ---------------------------------------------------------------------------
// signed zero canonicalize
// ---------------------------------------------------------------------------

describe('derivativeInto — signed zero canonicalize', () => {
  test('constant f = () => 0은 모든 entry가 +0이다', () => {
    const result = derivativeInto([], () => 0, 0, 1, 5);
    for (const v of result) {
      expect(Object.is(v, 0)).toBe(true);
    }
  });

  test('constant f = () => -0도 모든 entry가 +0이다 (canonicalize)', () => {
    const result = derivativeInto([], () => -0, 0, 1, 5);
    for (const v of result) {
      expect(Object.is(v, 0)).toBe(true);
    }
  });

  test('-0 diff가 발생하는 sequence는 +0으로 canonicalize된다', () => {
    // f(x) = -x * 0: f(-1)=+0, f(0)=-0, f(1)=-0.
    // y = [+0, -0, -0]. central:
    //   i=0 boundary: -0 - +0 = -0. value = -0 * invDx = -0 → canonicalize to +0.
    //   i=1 middle: -0 - +0 = -0. value = -0 * halfInvDx = -0 → canonicalize.
    //   i=2 boundary: -0 - -0 = +0. value = +0.
    const result = derivativeInto([], (x) => -x * 0, -1, 1, 3, { method: 'central' });
    for (const v of result) {
      expect(Object.is(v, 0)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// non-finite f(x) and arithmetic failure
// ---------------------------------------------------------------------------

describe('derivativeInto — f(x) non-finite는 RangeError이며 out을 수정하지 않는다', () => {
  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('f가 %s를 반환하면 RangeError', (bad) => {
    const out: number[] = [9, 9];
    expect(() => derivativeInto(out, () => bad, 0, 1, 4)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('f가 일부 grid point에서만 non-finite를 반환해도 RangeError', () => {
    const out: number[] = [9, 9];
    // 첫 호출은 정상, 두 번째는 NaN.
    let call = 0;
    const f = (_x: number) => (call++ === 0 ? 0 : Number.NaN);
    expect(() => derivativeInto(out, f, 0, 1, 4)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });
});

describe('derivativeInto — arithmetic overflow는 RangeError이며 out을 수정하지 않는다', () => {
  test('f가 MAX_VALUE와 -MAX_VALUE를 번갈아 반환하면 subtraction이 ±Infinity → RangeError', () => {
    const out: number[] = [9, 9];
    let call = 0;
    const f = (_x: number) => (call++ % 2 === 0 ? Number.MAX_VALUE : -Number.MAX_VALUE);
    // central: i=0 boundary diff = y[1] - y[0] = -MAX - MAX = -Infinity → RangeError.
    expect(() => derivativeInto(out, f, 0, 1, 4, { method: 'central' })).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('central middle row의 diff overflow도 RangeError', () => {
    // y = [MAX, 0, -MAX, ...]. i=1 middle diff = y[2] - y[0] = -MAX - MAX = -Infinity.
    const out: number[] = [9, 9];
    let call = 0;
    const values = [Number.MAX_VALUE, 0, -Number.MAX_VALUE, 0];
    const f = (_x: number) => values[call++ % values.length];
    expect(() => derivativeInto(out, f, 0, 1, 4, { method: 'central' })).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('central 첫 row boundary fallback에서 overflow하면 RangeError', () => {
    // central 첫 row는 forward one-sided `y[1] - y[0]`. y = [MAX, -MAX, 0, 0]에서 i=0 boundary
    // diff = -MAX - MAX = -Infinity → RangeError. central middle은 도달하지 않는다.
    const out: number[] = [9, 9];
    let call = 0;
    const values = [Number.MAX_VALUE, -Number.MAX_VALUE, 0, 0];
    const f = (_x: number) => values[call++];
    expect(() => derivativeInto(out, f, 0, 1, 4, { method: 'central' })).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('central 마지막 row boundary fallback에서 overflow하면 RangeError', () => {
    // central 마지막 row는 backward one-sided `y[n-1] - y[n-2]`. y = [0, 0, MAX, -MAX]에서
    // middle row(i=1: y[2]-y[0]=MAX, i=2: y[3]-y[1]=-MAX) 는 모두 finite, 마지막 boundary
    // `y[3] - y[2] = -MAX - MAX = -Infinity` 에서만 throw 한다.
    const out: number[] = [9, 9];
    let call = 0;
    const values = [0, 0, Number.MAX_VALUE, -Number.MAX_VALUE];
    const f = (_x: number) => values[call++];
    expect(() => derivativeInto(out, f, 0, 1, 4, { method: 'central' })).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });
});
