/**
 * hessian(Into) unit test.
 *
 * central-only method, diagonal + mixed partial, symmetry, scalar/vector step,
 * empty point with [] matrix and no callback, invalid f/point/method/step, callback result
 * non-finite, arithmetic overflow, matrix atomicity, nested aliasing, baseline 단일 평가,
 * signed-zero canonicalize.
 */

import { describe, expect, test, vi } from 'vitest';
import { hessian } from '../../../src/calculus/hessian';
import { hessianInto } from '../../../src/calculus/hessian-into';

/**
 * 대각 Hessian 검증용 quadratic fixture.
 * f([x, y]) = x^2 + y^2 → H = [[2, 0], [0, 2]] (mixed partial은 0).
 */
const fSumSq = (p: readonly number[]): number => p[0] * p[0] + p[1] * p[1];

/**
 * off-diagonal Hessian 검증용 bilinear fixture.
 * f([x, y]) = x * y → H = [[0, 1], [1, 0]].
 */
const fProd = (p: readonly number[]): number => p[0] * p[1];

// ---------------------------------------------------------------------------
// diagonal / mixed partial
// ---------------------------------------------------------------------------

describe('hessianInto — diagonal / mixed partial', () => {
  test('quadratic f(x, y) = x^2 + y^2의 Hessian은 [[2, 0], [0, 2]] (central, point=[3, -4], step=1e-3)', () => {
    // 기본 step=1e-5는 second-order central에서 1/h^2 증폭으로 rounding error가 커진다.
    // step=1e-3은 quadratic에서 충분히 정확하다.
    const out: number[][] = [];
    const result = hessianInto(out, fSumSq, [3, -4], { step: 1e-3 });
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out[0][0]).toBeCloseTo(2, 6);
    expect(out[0][1]).toBeCloseTo(0, 6);
    expect(out[1][0]).toBeCloseTo(0, 6);
    expect(out[1][1]).toBeCloseTo(2, 6);
  });

  test('bilinear f(x, y) = x * y의 Hessian은 [[0, 1], [1, 0]] (central, point=[2, 3], step=1e-3)', () => {
    const result = hessianInto([], fProd, [2, 3], { step: 1e-3 });
    expect(result).toHaveLength(2);
    // diagonal은 second derivative of bilinear = 0.
    expect(result[0][0]).toBeCloseTo(0, 6);
    expect(result[1][1]).toBeCloseTo(0, 6);
    // off-diagonal: ∂²(xy)/∂x∂y = 1.
    expect(result[0][1]).toBeCloseTo(1, 6);
    expect(result[1][0]).toBeCloseTo(1, 6);
  });

  test('cubic f(x, y) = x^3 + x * y^2의 Hessian은 [[6x, 2y], [2y, 2x]] (point=[1, 2])', () => {
    // ∂²f/∂x² = 6x = 6, ∂²f/∂y² = 2x = 2, ∂²f/∂x∂y = 2y = 4.
    const f = (p: readonly number[]): number => p[0] ** 3 + p[0] * p[1] * p[1];
    const result = hessianInto([], f, [1, 2], { step: 1e-3 });
    expect(result[0][0]).toBeCloseTo(6, 3);
    expect(result[1][1]).toBeCloseTo(2, 3);
    expect(result[0][1]).toBeCloseTo(4, 3);
    expect(result[1][0]).toBeCloseTo(4, 3);
  });

  test('1차원 quadratic f(x) = 5 x^2의 Hessian은 [[10]] (step=1e-3)', () => {
    const f = (p: readonly number[]): number => 5 * p[0] * p[0];
    const result = hessianInto([], f, [2], { step: 1e-3 });
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0]).toBeCloseTo(10, 5);
  });
});

describe('hessian — companion', () => {
  test('새 matrix를 반환한다 (step=1e-3)', () => {
    const result = hessian(fSumSq, [3, -4], { step: 1e-3 });
    expect(result).toHaveLength(2);
    expect(result[0][0]).toBeCloseTo(2, 6);
    expect(result[1][1]).toBeCloseTo(2, 6);
    expect(result[0][1]).toBeCloseTo(0, 6);
    expect(result[1][0]).toBeCloseTo(0, 6);
  });
});

// ---------------------------------------------------------------------------
// symmetry
// ---------------------------------------------------------------------------

describe('hessianInto — symmetry', () => {
  test('off-diagonal entry는 같은 산술 결과를 기록한다 (Object.is)', () => {
    // ∂²f/∂x_i∂x_j와 ∂²f/∂x_j∂x_i는 같은 값을 기록해야 한다(재계산 금지).
    const f = (p: readonly number[]): number => Math.sin(p[0]) * p[1] + Math.cos(p[2]) * p[0];
    const result = hessianInto([], f, [0.3, 0.5, 0.7], { step: 1e-4 });
    expect(result).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 3; j++) {
        expect(Object.is(result[i][j], result[j][i])).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// central-only method
// ---------------------------------------------------------------------------

describe('hessianInto — central-only method', () => {
  test('options 생략은 method "central"과 동등한 결과를 만든다', () => {
    const a = hessianInto([], fProd, [2, 3]);
    const b = hessianInto([], fProd, [2, 3], { method: 'central' });
    expect(a).toEqual(b);
  });

  test('method "forward"는 RangeError이며 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() => hessianInto(out, fSumSq, [1, 2], { method: 'forward' })).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('method "backward"는 RangeError이며 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() => hessianInto(out, fSumSq, [1, 2], { method: 'backward' })).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('invalid method literal은 RangeError (fail-fast)', () => {
    const out: number[][] = [[9, 9]];
    expect(() => hessianInto(out, fSumSq, [1, 2], { method: 'middle' as unknown as 'central' })).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });
});

describe('hessian — central-only method', () => {
  test('method "forward"는 RangeError', () => {
    expect(() => hessian(fSumSq, [1, 2], { method: 'forward' })).toThrow(RangeError);
  });

  test('method "backward"는 RangeError', () => {
    expect(() => hessian(fSumSq, [1, 2], { method: 'backward' })).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// baseline f(x) 단일 평가
// ---------------------------------------------------------------------------

describe('hessianInto — baseline f(point)은 한 번만 평가된다', () => {
  test('baseline 입력(perturbation 없는 point)은 정확히 한 번만 호출된다', () => {
    const baseInputs: number[][] = [];
    const point: readonly number[] = [1, 2];
    const f = (x: readonly number[]): number => {
      // baseline 호출은 perturbation이 없는 입력이다. point와 entry-wise 일치인 호출만 센다.
      let same = x.length === point.length;
      for (let i = 0; same && i < x.length; i++) {
        if (x[i] !== point[i]) {
          same = false;
        }
      }
      if (same) {
        baseInputs.push(x.slice());
      }
      return x[0] * x[0] + x[1] * x[1];
    };
    hessianInto([], f, point);
    expect(baseInputs).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// step option — scalar vs vector
// ---------------------------------------------------------------------------

describe('hessianInto — step option', () => {
  test('scalar step과 동일한 값을 갖는 per-axis step vector는 같은 결과를 만든다', () => {
    const scalar = hessianInto([], fSumSq, [1, 2], { step: 1e-4 });
    const vector = hessianInto([], fSumSq, [1, 2], { step: [1e-4, 1e-4] });
    expect(scalar).toEqual(vector);
  });
});

// ---------------------------------------------------------------------------
// empty point
// ---------------------------------------------------------------------------

describe('hessianInto — empty point', () => {
  test('point.length === 0이면 []을 기록하고 f를 호출하지 않는다', () => {
    const f = vi.fn((x: readonly number[]) => x.length);
    const out: number[][] = [];
    const result = hessianInto(out, f, []);
    expect(result).toBe(out);
    expect(out).toEqual([]);
    expect(f).not.toHaveBeenCalled();
  });

  test('empty point에서도 기존 out row를 truncate한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    hessianInto(out, (x) => x.length, []);
    expect(out).toEqual([]);
  });

  test('empty point + invalid method는 RangeError (fail-fast), callback 미호출', () => {
    const f = vi.fn((x: readonly number[]) => x.length);
    const out: number[][] = [[9]];
    expect(() => hessianInto(out, f, [], { method: 'middle' as unknown as 'central' })).toThrow(RangeError);
    expect(out).toEqual([[9]]);
    expect(f).not.toHaveBeenCalled();
  });

  test('empty point + method "forward"는 RangeError (fail-fast), callback 미호출', () => {
    const f = vi.fn((x: readonly number[]) => x.length);
    const out: number[][] = [[9]];
    expect(() => hessianInto(out, f, [], { method: 'forward' })).toThrow(RangeError);
    expect(out).toEqual([[9]]);
    expect(f).not.toHaveBeenCalled();
  });
});

describe('hessian — empty point', () => {
  test('empty point는 새 빈 matrix를 반환한다', () => {
    expect(hessian((x) => x.length, [])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// invalid input — TypeError / RangeError, out atomicity
// ---------------------------------------------------------------------------

describe('hessianInto — invalid input은 throw하고 out을 수정하지 않는다', () => {
  test('f가 function 아니면 TypeError', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() => hessianInto(out, undefined as unknown as (p: readonly number[]) => number, [1])).toThrow(TypeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
    expect(() => hessianInto(out, null as unknown as (p: readonly number[]) => number, [1])).toThrow(TypeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
    expect(() => hessianInto(out, 42 as unknown as (p: readonly number[]) => number, [1])).toThrow(TypeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('point가 array 아니면 TypeError', () => {
    const out: number[][] = [[9, 9]];
    expect(() => hessianInto(out, fSumSq, undefined as unknown as readonly number[])).toThrow(TypeError);
    expect(out).toEqual([[9, 9]]);
    expect(() => hessianInto(out, fSumSq, 5 as unknown as readonly number[])).toThrow(TypeError);
    expect(out).toEqual([[9, 9]]);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('point entry %s는 RangeError', (bad) => {
    const out: number[][] = [[9, 9]];
    expect(() => hessianInto(out, fSumSq, [1, bad, 2])).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test.each([
    0,
    -1,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('scalar step %s는 RangeError', (bad) => {
    const out: number[][] = [[9, 9]];
    expect(() => hessianInto(out, fSumSq, [1, 2], { step: bad })).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('step vector length mismatch는 RangeError', () => {
    const out: number[][] = [[9, 9]];
    expect(() => hessianInto(out, fSumSq, [1, 2], { step: [1e-5] })).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
    expect(() => hessianInto(out, fSumSq, [1, 2], { step: [1e-5, 1e-5, 1e-5] })).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test.each([
    0,
    -1,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('step vector entry %s는 RangeError', (bad) => {
    const out: number[][] = [[9, 9]];
    expect(() => hessianInto(out, fSumSq, [1, 2], { step: [1e-5, bad] })).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });
});

describe('hessian — invalid input은 throw한다', () => {
  test('f가 function 아니면 TypeError', () => {
    expect(() => hessian(undefined as unknown as (p: readonly number[]) => number, [1])).toThrow(TypeError);
  });

  test('point가 array 아니면 TypeError', () => {
    expect(() => hessian(fSumSq, 5 as unknown as readonly number[])).toThrow(TypeError);
  });

  test('point entry NaN은 RangeError', () => {
    expect(() => hessian(fSumSq, [Number.NaN])).toThrow(RangeError);
  });

  test('invalid method는 RangeError', () => {
    expect(() => hessian(fSumSq, [1], { method: 'middle' as unknown as 'central' })).toThrow(RangeError);
  });

  test('scalar step 0은 RangeError', () => {
    expect(() => hessian(fSumSq, [1], { step: 0 })).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// callback result non-finite
// ---------------------------------------------------------------------------

describe('hessianInto — callback result non-finite는 RangeError이며 out을 수정하지 않는다', () => {
  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('baseline f(point)이 %s를 반환하면 RangeError', (bad) => {
    const out: number[][] = [[9, 9]];
    let call = 0;
    // 첫 호출(baseline)에서 non-finite → fail-fast.
    const f = (_x: readonly number[]) => (call++ === 0 ? bad : 0);
    expect(() => hessianInto(out, f, [1, 2])).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('diagonal plus evaluation에서 NaN이면 RangeError', () => {
    const out: number[][] = [[9, 9]];
    let call = 0;
    // baseline은 0, 두 번째 호출(plus)에서 NaN.
    const f = (_x: readonly number[]) => (call++ === 1 ? Number.NaN : 0);
    expect(() => hessianInto(out, f, [1, 2])).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });
});

// ---------------------------------------------------------------------------
// arithmetic overflow
// ---------------------------------------------------------------------------

describe('hessianInto — arithmetic overflow는 RangeError이며 out을 수정하지 않는다', () => {
  test('diagonal에서 numerator overflow → RangeError', () => {
    const out: number[][] = [[9]];
    let call = 0;
    // baseline=0, plus=MAX_VALUE, minus=MAX_VALUE → numerator = MAX + MAX = Infinity.
    const values = [0, Number.MAX_VALUE, Number.MAX_VALUE];
    const f = (_x: readonly number[]) => values[call++];
    expect(() => hessianInto(out, f, [1])).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('off-diagonal mixed partial에서 numerator overflow → RangeError', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    // n=2 호출 순서: baseline → diag i=0(plus,minus) → diag i=1(plus,minus) → off-diag(pp,pm,mp,mm).
    // diagonal은 finite 결과로 통과시키고, mixed partial pp - pm 단계에서 +Inf를 만들기 위해
    // fpp = MAX, fpm = -MAX. fmp/fmm은 0.
    let call = 0;
    const values = [
      0, // baseline
      0, // diag i=0 plus
      0, // diag i=0 minus
      0, // diag i=1 plus
      0, // diag i=1 minus
      Number.MAX_VALUE, // pp
      -Number.MAX_VALUE, // pm
      0, // mp
      0, // mm
    ];
    const f = (_x: readonly number[]) => values[call++];
    expect(() => hessianInto(out, f, [1, 2])).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
    // numerator는 pp/pm/mp/mm 4회 모두 평가한 뒤 검증되므로 9회가 정확히 도달해야 한다.
    // 호출 횟수 단언으로 short-circuit 회귀나 평가 순서 표류를 감지한다.
    expect(call).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// nested aliasing
// ---------------------------------------------------------------------------

describe('hessianInto — nested aliasing 안전', () => {
  test('out[0]을 point로 그대로 넘겨도 결과가 정확하다 (perturb는 slice로 fresh array)', () => {
    const point: number[] = [3, -4];
    const out: number[][] = [point, []];
    const result = hessianInto(out, fSumSq, point, { step: 1e-3 });
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    // H(x^2 + y^2) = [[2, 0], [0, 2]].
    expect(out[0][0]).toBeCloseTo(2, 6);
    expect(out[0][1]).toBeCloseTo(0, 6);
    expect(out[1][0]).toBeCloseTo(0, 6);
    expect(out[1][1]).toBeCloseTo(2, 6);
  });

  test('callback이 받은 perturbed point를 mutate해도 caller point는 그대로 유지된다', () => {
    const point: readonly number[] = [1, 2];
    const f = (x: readonly number[]): number => {
      (x as number[])[0] = 999;
      (x as number[])[1] = 999;
      return x[0] * x[0] + x[1] * x[1];
    };
    hessianInto([], f, point);
    expect(point).toEqual([1, 2]);
  });
});

// ---------------------------------------------------------------------------
// signed-zero canonicalize
// ---------------------------------------------------------------------------

describe('hessianInto — signed zero canonicalize', () => {
  test('constant f = () => 0의 Hessian entry는 모두 +0이다 (Object.is)', () => {
    const result = hessianInto([], () => 0, [1, 2, 3]);
    for (const row of result) {
      for (const v of row) {
        expect(Object.is(v, 0)).toBe(true);
      }
    }
  });

  test('linear f = (x) => 2*x[0] + 3*x[1]의 Hessian entry는 모두 +0이다 (Object.is)', () => {
    // linear는 모든 second derivative = 0이지만, finite-difference 산술에서 -0이 새어 나올 수 있다.
    const result = hessianInto([], (p) => 2 * p[0] + 3 * p[1], [0, 0], { step: 1 });
    for (const row of result) {
      for (const v of row) {
        expect(Object.is(v, 0)).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// out atomicity (성공)
// ---------------------------------------------------------------------------

describe('hessianInto — 성공 시 out atomicity', () => {
  test('기존 row를 n으로 truncate하고 같은 out을 반환한다', () => {
    const out: number[][] = [
      [99, 99, 99],
      [99, 99, 99],
      [99, 99, 99],
      [99, 99, 99],
    ];
    const result = hessianInto(out, fSumSq, [1, 1]);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out[0]).toHaveLength(2);
    expect(out[1]).toHaveLength(2);
  });

  test('기존 out[r]가 array가 아니어도 새 row를 만들어 commit한다', () => {
    const out: number[][] = [];
    // 임의 비-array entry를 두기 위해 length만 늘려둔다.
    out.length = 5;
    const result = hessianInto(out, fSumSq, [0, 0]);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(Array.isArray(out[0])).toBe(true);
    expect(Array.isArray(out[1])).toBe(true);
  });
});
