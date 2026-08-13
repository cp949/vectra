/**
 * gradient(Into) unit test.
 *
 * central/forward/backward method, scalar/vector step, empty point,
 * invalid f/point/method/step, non-finite point entry, callback result non-finite,
 * arithmetic overflow, atomicity, out=point aliasing, signed-zero canonicalize.
 */

import { describe, expect, test, vi } from 'vitest';
import { gradient } from '../../../src/calculus/gradient';
import { gradientInto } from '../../../src/calculus/gradient-into';

// ---------------------------------------------------------------------------
// gradientInto / gradient — central method (default)
// ---------------------------------------------------------------------------

describe('gradientInto — central 차분 (Into, default)', () => {
  test('quadratic f(x) = x0^2 + x1^2의 gradient는 [2 x0, 2 x1]에 근접한다', () => {
    const out: number[] = [];
    const result = gradientInto(out, (x) => x[0] * x[0] + x[1] * x[1], [3, -4], { method: 'central' });
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out[0]).toBeCloseTo(6, 6);
    expect(out[1]).toBeCloseTo(-8, 6);
  });

  test('options 생략은 central method와 동등한 결과를 만든다', () => {
    const defaultResult = gradientInto([], (x) => x[0] * x[0] + x[1] * x[1], [3, -4]);
    const explicitResult = gradientInto([], (x) => x[0] * x[0] + x[1] * x[1], [3, -4], { method: 'central' });
    expect(defaultResult).toEqual(explicitResult);
  });

  test('linear f(x) = 2 x0 + 3 x1 + 1은 step=1/point=[0,0]에서 모든 method가 exact [2, 3]을 반환한다 (Object.is)', () => {
    // floating-point step=1e-5와 point=[5,-2] 조합은 (2h)/(2h) 산술에서 rounding error를 만든다.
    // step=1과 point=[0,0]은 모든 분기에서 정확한 정수 산술을 보장한다.
    const f = (x: readonly number[]) => 2 * x[0] + 3 * x[1] + 1;
    for (const method of ['forward', 'backward', 'central'] as const) {
      const result = gradientInto([], f, [0, 0], { method, step: 1 });
      expect(result).toHaveLength(2);
      expect(Object.is(result[0], 2)).toBe(true);
      expect(Object.is(result[1], 3)).toBe(true);
    }
  });
});

describe('gradient — central 차분 (companion, default)', () => {
  test('새 배열을 반환한다', () => {
    const result = gradient((x) => x[0] * x[0] + x[1] * x[1], [3, -4]);
    expect(result).toHaveLength(2);
    expect(result[0]).toBeCloseTo(6, 6);
    expect(result[1]).toBeCloseTo(-8, 6);
  });
});

// ---------------------------------------------------------------------------
// gradientInto — forward method
// ---------------------------------------------------------------------------

describe('gradientInto — forward 차분', () => {
  test('quadratic f(x) = x0^2 + x1^2의 forward gradient는 [2 x0, 2 x1]에 근접한다', () => {
    const result = gradientInto([], (x) => x[0] * x[0] + x[1] * x[1], [3, -4], { method: 'forward' });
    expect(result[0]).toBeCloseTo(6, 3);
    expect(result[1]).toBeCloseTo(-8, 3);
  });
});

// ---------------------------------------------------------------------------
// gradientInto — backward method
// ---------------------------------------------------------------------------

describe('gradientInto — backward 차분', () => {
  test('quadratic f(x) = x0^2 + x1^2의 backward gradient는 [2 x0, 2 x1]에 근접한다', () => {
    const result = gradientInto([], (x) => x[0] * x[0] + x[1] * x[1], [3, -4], { method: 'backward' });
    expect(result[0]).toBeCloseTo(6, 3);
    expect(result[1]).toBeCloseTo(-8, 3);
  });
});

// ---------------------------------------------------------------------------
// step option — scalar vs vector
// ---------------------------------------------------------------------------

describe('gradientInto — step option', () => {
  test('scalar step과 동일한 값을 갖는 per-axis step vector는 같은 결과를 만든다', () => {
    const f = (x: readonly number[]) => x[0] * x[0] + 3 * x[1];
    const scalar = gradientInto([], f, [1, 2], { method: 'central', step: 1e-4 });
    const vector = gradientInto([], f, [1, 2], { method: 'central', step: [1e-4, 1e-4] });
    expect(scalar).toEqual(vector);
  });

  test('vector step entry가 다르면 결과도 다르다 (axis별 step 적용 확인)', () => {
    // linear에서는 step이 달라도 결과는 같지만, quadratic에서는 step에 따른 truncation error가 다르다.
    const f = (x: readonly number[]) => x[0] * x[0] * x[0]; // df/dx0 = 3 x0^2.
    const tight = gradientInto([], f, [1, 0], { method: 'central', step: [1e-6, 1e-6] });
    const loose = gradientInto([], f, [1, 0], { method: 'central', step: [1e-1, 1e-1] });
    expect(tight[0]).toBeCloseTo(3, 6);
    // loose step은 3에 더 멀다. 두 결과가 다른지만 확인하면 axis별 적용을 간접 검증한다.
    expect(loose[0]).not.toBe(tight[0]);
  });
});

// ---------------------------------------------------------------------------
// empty point — degenerate
// ---------------------------------------------------------------------------

describe('gradientInto — empty point', () => {
  test('point.length === 0이면 []을 기록하고 f를 호출하지 않는다 (모든 method)', () => {
    for (const method of ['forward', 'backward', 'central'] as const) {
      const f = vi.fn((x: readonly number[]) => x.length);
      const out: number[] = [];
      const result = gradientInto(out, f, [], { method });
      expect(result).toBe(out);
      expect(out).toEqual([]);
      expect(f).not.toHaveBeenCalled();
    }
  });

  test('empty point에서도 기존 out entry를 truncate한다', () => {
    const out: number[] = [9, 9, 9];
    gradientInto(out, (x) => x.length, []);
    expect(out).toEqual([]);
  });

  test('empty point + invalid method는 RangeError (fail-fast)', () => {
    const f = vi.fn((x: readonly number[]) => x.length);
    const out: number[] = [9];
    expect(() => gradientInto(out, f, [], { method: 'middle' as unknown as 'central' })).toThrow(RangeError);
    expect(out).toEqual([9]);
    expect(f).not.toHaveBeenCalled();
  });
});

describe('gradient — empty point', () => {
  test('empty point는 새 빈 배열을 반환한다', () => {
    expect(gradient((x) => x.length, [])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// invalid input — TypeError / RangeError, out atomicity
// ---------------------------------------------------------------------------

describe('gradientInto — invalid input은 throw하고 out을 수정하지 않는다', () => {
  test('f가 function 아니면 TypeError', () => {
    const out: number[] = [9, 9, 9];
    expect(() => gradientInto(out, undefined as unknown as (p: readonly number[]) => number, [1])).toThrow(TypeError);
    expect(out).toEqual([9, 9, 9]);
    expect(() => gradientInto(out, null as unknown as (p: readonly number[]) => number, [1])).toThrow(TypeError);
    expect(out).toEqual([9, 9, 9]);
    expect(() => gradientInto(out, 42 as unknown as (p: readonly number[]) => number, [1])).toThrow(TypeError);
    expect(out).toEqual([9, 9, 9]);
  });

  test('point가 array 아니면 TypeError', () => {
    const out: number[] = [9, 9, 9];
    const f = (x: readonly number[]) => x[0];
    expect(() => gradientInto(out, f, undefined as unknown as readonly number[])).toThrow(TypeError);
    expect(out).toEqual([9, 9, 9]);
    expect(() => gradientInto(out, f, null as unknown as readonly number[])).toThrow(TypeError);
    expect(out).toEqual([9, 9, 9]);
    expect(() => gradientInto(out, f, 5 as unknown as readonly number[])).toThrow(TypeError);
    expect(out).toEqual([9, 9, 9]);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('point entry %s는 RangeError', (bad) => {
    const out: number[] = [9, 9, 9];
    expect(() => gradientInto(out, (x) => x[0], [1, bad, 2])).toThrow(RangeError);
    expect(out).toEqual([9, 9, 9]);
  });

  test('invalid method는 RangeError이며 out을 수정하지 않는다', () => {
    const out: number[] = [9, 9, 9];
    expect(() => gradientInto(out, (x) => x[0], [1, 2], { method: 'middle' as unknown as 'central' })).toThrow(
      RangeError
    );
    expect(out).toEqual([9, 9, 9]);
  });

  test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'scalar step %s는 RangeError',
    (bad) => {
      const out: number[] = [9, 9, 9];
      expect(() => gradientInto(out, (x) => x[0], [1, 2], { step: bad })).toThrow(RangeError);
      expect(out).toEqual([9, 9, 9]);
    }
  );

  test('step vector length mismatch는 RangeError', () => {
    const out: number[] = [9, 9, 9];
    expect(() => gradientInto(out, (x) => x[0], [1, 2], { step: [1e-5] })).toThrow(RangeError);
    expect(out).toEqual([9, 9, 9]);
    expect(() => gradientInto(out, (x) => x[0], [1, 2], { step: [1e-5, 1e-5, 1e-5] })).toThrow(RangeError);
    expect(out).toEqual([9, 9, 9]);
  });

  test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'step vector entry %s는 RangeError',
    (bad) => {
      const out: number[] = [9, 9, 9];
      expect(() => gradientInto(out, (x) => x[0], [1, 2], { step: [1e-5, bad] })).toThrow(RangeError);
      expect(out).toEqual([9, 9, 9]);
    }
  );
});

describe('gradient — invalid input은 throw한다', () => {
  test('f가 function 아니면 TypeError', () => {
    expect(() => gradient(undefined as unknown as (p: readonly number[]) => number, [1])).toThrow(TypeError);
  });

  test('point가 array 아니면 TypeError', () => {
    expect(() => gradient((x) => x[0], 5 as unknown as readonly number[])).toThrow(TypeError);
  });

  test('point entry NaN은 RangeError', () => {
    expect(() => gradient((x) => x[0], [Number.NaN])).toThrow(RangeError);
  });

  test('invalid method는 RangeError', () => {
    expect(() => gradient((x) => x[0], [1], { method: 'middle' as unknown as 'central' })).toThrow(RangeError);
  });

  test('scalar step 0은 RangeError', () => {
    expect(() => gradient((x) => x[0], [1], { step: 0 })).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// callback result non-finite
// ---------------------------------------------------------------------------

describe('gradientInto — callback result non-finite는 RangeError이며 out을 수정하지 않는다', () => {
  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('f가 %s를 반환하면 RangeError', (bad) => {
    const out: number[] = [9, 9];
    expect(() => gradientInto(out, () => bad, [1, 2])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('forward method에서 baseline f(point)가 NaN이면 RangeError', () => {
    const out: number[] = [9, 9];
    let call = 0;
    // baseline 첫 호출에서 NaN → fail-fast.
    const f = (_x: readonly number[]) => (call++ === 0 ? Number.NaN : 0);
    expect(() => gradientInto(out, f, [1, 2], { method: 'forward' })).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });
});

// ---------------------------------------------------------------------------
// arithmetic overflow
// ---------------------------------------------------------------------------

describe('gradientInto — arithmetic overflow는 RangeError이며 out을 수정하지 않는다', () => {
  test('central에서 fPlus=MAX_VALUE, fMinus=-MAX_VALUE → subtraction overflow → RangeError', () => {
    const out: number[] = [9];
    // f(point) is unused for central; only plus/minus.
    let call = 0;
    const values = [Number.MAX_VALUE, -Number.MAX_VALUE];
    const f = (_x: readonly number[]) => values[call++ % values.length];
    expect(() => gradientInto(out, f, [1], { method: 'central' })).toThrow(RangeError);
    expect(out).toEqual([9]);
  });

  test('forward에서 baseline=-MAX, fPlus=MAX → fPlus - baseline overflow → RangeError', () => {
    const out: number[] = [9];
    // baseline(call 0), plus(call 1). 호출 횟수 단언으로 분기 표류를 감지한다.
    let call = 0;
    const values = [-Number.MAX_VALUE, Number.MAX_VALUE];
    const f = (_x: readonly number[]) => values[call++];
    expect(() => gradientInto(out, f, [1], { method: 'forward' })).toThrow(RangeError);
    expect(out).toEqual([9]);
    expect(call).toBe(2);
  });

  test('backward에서 baseline=MAX, fMinus=-MAX → baseline - fMinus overflow → RangeError', () => {
    const out: number[] = [9];
    // baseline(call 0), minus(call 1). 호출 횟수 단언으로 분기 표류를 감지한다.
    let call = 0;
    const values = [Number.MAX_VALUE, -Number.MAX_VALUE];
    const f = (_x: readonly number[]) => values[call++];
    expect(() => gradientInto(out, f, [1], { method: 'backward' })).toThrow(RangeError);
    expect(out).toEqual([9]);
    expect(call).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// out === point aliasing
// ---------------------------------------------------------------------------

describe('gradientInto — out === point aliasing 안전', () => {
  test('point를 out으로 그대로 넘겨도 결과가 정확하다 (perturb는 slice로 fresh array)', () => {
    const point: number[] = [3, -4];
    const result = gradientInto(point, (x) => x[0] * x[0] + x[1] * x[1], point, { method: 'central' });
    expect(result).toBe(point);
    expect(point).toHaveLength(2);
    expect(point[0]).toBeCloseTo(6, 6);
    expect(point[1]).toBeCloseTo(-8, 6);
  });

  test('callback이 받은 perturbed point를 mutate해도 caller point는 그대로 유지된다', () => {
    const point: readonly number[] = [1, 2];
    const f = (x: readonly number[]) => {
      // perturb은 fresh slice이므로 mutate는 caller에 영향이 없다.
      (x as number[])[0] = 999;
      (x as number[])[1] = 999;
      return x[0] + x[1];
    };
    gradientInto([], f, point, { method: 'central' });
    expect(point).toEqual([1, 2]);
  });
});

// ---------------------------------------------------------------------------
// signed-zero canonicalize
// ---------------------------------------------------------------------------

describe('gradientInto — signed zero canonicalize', () => {
  test('constant f = () => 0의 gradient entry는 모두 +0이다', () => {
    const result = gradientInto([], () => 0, [1, 2, 3], { method: 'central' });
    for (const v of result) {
      expect(Object.is(v, 0)).toBe(true);
    }
  });

  test('forward에서 fPlus === baseline인 constant도 +0으로 canonicalize된다', () => {
    const result = gradientInto([], () => 5, [0, 0], { method: 'forward' });
    for (const v of result) {
      expect(Object.is(v, 0)).toBe(true);
    }
  });

  test('backward에서 baseline === fMinus인 constant도 +0으로 canonicalize된다', () => {
    const result = gradientInto([], () => -7, [1, 1], { method: 'backward' });
    for (const v of result) {
      expect(Object.is(v, 0)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// 성공 시 out atomicity
// ---------------------------------------------------------------------------

describe('gradientInto — 성공 시 out atomicity', () => {
  test('기존 entry를 point.length로 truncate하고 같은 out을 반환한다', () => {
    const out: number[] = [99, 99, 99, 99, 99];
    const result = gradientInto(out, (x) => x[0] * x[0] + x[1] * x[1], [1, 1], { method: 'central' });
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
  });
});
