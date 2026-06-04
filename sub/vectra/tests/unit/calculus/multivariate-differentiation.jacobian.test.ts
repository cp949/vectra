/**
 * jacobian(Into) unit test.
 *
 * central/forward/backward method, row/column convention, scalar/vector step,
 * empty point with m x 0 matrix, invalid callback result (type/length/non-finite),
 * invalid f/point/method/step, arithmetic overflow, matrix atomicity, nested aliasing,
 * signed-zero canonicalize.
 */

import { describe, expect, test, vi } from 'vitest';
import { jacobian } from '../../../src/calculus/jacobian';
import { jacobianInto } from '../../../src/calculus/jacobian-into';

/**
 * 비선형 벡터 함수 fixture.
 * f([x, y]) = [x + y, x * y]에서 Jacobian은 [[1, 1], [y, x]]이다.
 * step=1, point=[0,0]에서 central/forward/backward 모두 정확한 정수 산술로 평가된다.
 */
const fSumProd = (x: readonly number[]): number[] => [x[0] + x[1], x[0] * x[1]];

// ---------------------------------------------------------------------------
// row=output, column=input convention
// ---------------------------------------------------------------------------

describe('jacobianInto — row/column convention', () => {
  test('f([x, y]) = [x + y, x * y]의 Jacobian은 [[1, 1], [y, x]] (central, step=1, point=[2, 3])', () => {
    const out: number[][] = [];
    const result = jacobianInto(out, fSumProd, [2, 3], { method: 'central', step: 1 });
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out[0][0]).toBeCloseTo(1, 6);
    expect(out[0][1]).toBeCloseTo(1, 6);
    expect(out[1][0]).toBeCloseTo(3, 6);
    expect(out[1][1]).toBeCloseTo(2, 6);
  });

  test('forward/backward/central 모두 linear+bilinear baseline에서 [[1, 1], [y, x]]를 재현한다 (step=1, point=[0, 0])', () => {
    for (const method of ['forward', 'backward', 'central'] as const) {
      const result = jacobianInto([], fSumProd, [0, 0], { method, step: 1 });
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2);
      expect(result[1]).toHaveLength(2);
      // ∂f0/∂x = ∂f0/∂y = 1.
      expect(result[0][0]).toBeCloseTo(1, 6);
      expect(result[0][1]).toBeCloseTo(1, 6);
      // ∂f1/∂x = y = 0, ∂f1/∂y = x = 0 (point=[0, 0]).
      expect(Object.is(result[1][0], 0)).toBe(true);
      expect(Object.is(result[1][1], 0)).toBe(true);
    }
  });

  test('non-square Jacobian: m=3, n=2 — f([x, y]) = [x, y, x + y]는 [[1,0],[0,1],[1,1]]', () => {
    const f = (p: readonly number[]): number[] => [p[0], p[1], p[0] + p[1]];
    const result = jacobianInto([], f, [0, 0], { method: 'central', step: 1 });
    expect(result).toHaveLength(3);
    expect(result[0][0]).toBeCloseTo(1, 6);
    expect(result[0][1]).toBeCloseTo(0, 6);
    expect(result[1][0]).toBeCloseTo(0, 6);
    expect(result[1][1]).toBeCloseTo(1, 6);
    expect(result[2][0]).toBeCloseTo(1, 6);
    expect(result[2][1]).toBeCloseTo(1, 6);
  });
});

describe('jacobian — companion', () => {
  test('새 matrix를 반환하고 같은 convention을 갖는다', () => {
    const result = jacobian(fSumProd, [2, 3], { method: 'central', step: 1 });
    expect(result).toHaveLength(2);
    expect(result[0][0]).toBeCloseTo(1, 6);
    expect(result[0][1]).toBeCloseTo(1, 6);
    expect(result[1][0]).toBeCloseTo(3, 6);
    expect(result[1][1]).toBeCloseTo(2, 6);
  });
});

// ---------------------------------------------------------------------------
// step option — scalar vs vector
// ---------------------------------------------------------------------------

describe('jacobianInto — step option', () => {
  test('scalar step과 동일한 값을 갖는 per-axis step vector는 같은 결과를 만든다', () => {
    const scalar = jacobianInto([], fSumProd, [1, 2], { method: 'central', step: 1e-4 });
    const vector = jacobianInto([], fSumProd, [1, 2], { method: 'central', step: [1e-4, 1e-4] });
    expect(scalar).toEqual(vector);
  });
});

// ---------------------------------------------------------------------------
// empty point — m x 0 matrix
// ---------------------------------------------------------------------------

describe('jacobianInto — empty point', () => {
  test('point.length === 0이면 callback 한 번 호출 후 m x 0 matrix 반환 (모든 method)', () => {
    for (const method of ['forward', 'backward', 'central'] as const) {
      const f = vi.fn((_x: readonly number[]) => [1, 2, 3] as number[]);
      const out: number[][] = [];
      const result = jacobianInto(out, f, [], { method });
      expect(result).toBe(out);
      expect(f).toHaveBeenCalledTimes(1);
      expect(out).toHaveLength(3);
      expect(out[0]).toEqual([]);
      expect(out[1]).toEqual([]);
      expect(out[2]).toEqual([]);
    }
  });

  test('empty point에서 기존 out row를 truncate한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
      [9, 9],
      [9, 9],
    ];
    const result = jacobianInto(out, () => [1, 2], []);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual([]);
    expect(out[1]).toEqual([]);
  });

  test('empty point + callback이 빈 array 반환 → 0 x 0 matrix', () => {
    const result = jacobianInto([], () => [], []);
    expect(result).toEqual([]);
  });

  test('empty point + invalid method는 RangeError (fail-fast), callback 미호출', () => {
    const f = vi.fn((_x: readonly number[]) => [1] as number[]);
    const out: number[][] = [[9]];
    expect(() => jacobianInto(out, f, [], { method: 'middle' as unknown as 'central' })).toThrow(RangeError);
    expect(out).toEqual([[9]]);
    expect(f).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// invalid callback result
// ---------------------------------------------------------------------------

describe('jacobianInto — callback result invalid', () => {
  test('callback이 array가 아니면 TypeError이며 out을 수정하지 않는다 (number)', () => {
    const out: number[][] = [[9, 9]];
    expect(() => jacobianInto(out, (() => 1) as unknown as (p: readonly number[]) => readonly number[], [1])).toThrow(
      TypeError
    );
    expect(out).toEqual([[9, 9]]);
  });

  test('callback이 array가 아니면 TypeError (string)', () => {
    const out: number[][] = [[9, 9]];
    expect(() =>
      jacobianInto(out, (() => 'abc') as unknown as (p: readonly number[]) => readonly number[], [1])
    ).toThrow(TypeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('callback이 array가 아니면 TypeError (undefined)', () => {
    const out: number[][] = [[9, 9]];
    expect(() =>
      jacobianInto(out, (() => undefined) as unknown as (p: readonly number[]) => readonly number[], [1])
    ).toThrow(TypeError);
    expect(out).toEqual([[9, 9]]);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('callback array entry %s는 RangeError이며 out을 수정하지 않는다', (bad) => {
    const out: number[][] = [[9, 9]];
    expect(() => jacobianInto(out, () => [bad], [1])).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('callback result entry가 number 아니면 RangeError', () => {
    const out: number[][] = [[9, 9]];
    expect(() =>
      jacobianInto(out, (() => ['a']) as unknown as (p: readonly number[]) => readonly number[], [1])
    ).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('evaluation마다 result length가 달라지면 RangeError이며 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    // baseline은 length 2를 반환하지만, 두 번째 호출(perturbed)에서 length 1을 반환.
    let call = 0;
    const f = (_x: readonly number[]): number[] => (call++ === 0 ? [1, 2] : [1]);
    expect(() => jacobianInto(out, f, [1, 2], { method: 'central' })).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('perturbed result length가 baseline보다 길어져도 RangeError이며 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    // baseline=length 1, perturbed=length 2(확장 방향).
    // assertResultLength가 strict equality(!==)를 유지하는지 검증(`<`만 검사하도록 회귀되지 않도록).
    let call = 0;
    const f = (_x: readonly number[]): number[] => (call++ === 0 ? [1] : [1, 2]);
    expect(() => jacobianInto(out, f, [1, 2], { method: 'central' })).toThrow(RangeError);
    expect(out).toEqual([[9]]);
    // baseline(1) + 첫 perturbed(1) = 2회에서 throw. 분기 표류를 감지한다.
    expect(call).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// invalid input — TypeError / RangeError, out atomicity
// ---------------------------------------------------------------------------

describe('jacobianInto — invalid input은 throw하고 out을 수정하지 않는다', () => {
  test('f가 function 아니면 TypeError', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() => jacobianInto(out, undefined as unknown as (p: readonly number[]) => readonly number[], [1])).toThrow(
      TypeError
    );
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('point가 array 아니면 TypeError', () => {
    const out: number[][] = [[9, 9]];
    expect(() => jacobianInto(out, () => [1], undefined as unknown as readonly number[])).toThrow(TypeError);
    expect(out).toEqual([[9, 9]]);
    expect(() => jacobianInto(out, () => [1], 5 as unknown as readonly number[])).toThrow(TypeError);
    expect(out).toEqual([[9, 9]]);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('point entry %s는 RangeError', (bad) => {
    const out: number[][] = [[9, 9]];
    expect(() => jacobianInto(out, (x) => [x[0]], [1, bad, 2])).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('invalid method는 RangeError이며 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() => jacobianInto(out, (x) => [x[0]], [1, 2], { method: 'middle' as unknown as 'central' })).toThrow(
      RangeError
    );
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
    expect(() => jacobianInto(out, (x) => [x[0]], [1, 2], { step: bad })).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('step vector length mismatch는 RangeError', () => {
    const out: number[][] = [[9, 9]];
    expect(() => jacobianInto(out, (x) => [x[0]], [1, 2], { step: [1e-5] })).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
    expect(() => jacobianInto(out, (x) => [x[0]], [1, 2], { step: [1e-5, 1e-5, 1e-5] })).toThrow(RangeError);
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
    expect(() => jacobianInto(out, (x) => [x[0]], [1, 2], { step: [1e-5, bad] })).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });
});

describe('jacobian — invalid input은 throw한다', () => {
  test('f가 function 아니면 TypeError', () => {
    expect(() => jacobian(undefined as unknown as (p: readonly number[]) => readonly number[], [1])).toThrow(TypeError);
  });

  test('point가 array 아니면 TypeError', () => {
    expect(() => jacobian(() => [1], 5 as unknown as readonly number[])).toThrow(TypeError);
  });

  test('point entry NaN은 RangeError', () => {
    expect(() => jacobian(() => [1], [Number.NaN])).toThrow(RangeError);
  });

  test('invalid method는 RangeError', () => {
    expect(() => jacobian(() => [1], [1], { method: 'middle' as unknown as 'central' })).toThrow(RangeError);
  });

  test('scalar step 0은 RangeError', () => {
    expect(() => jacobian(() => [1], [1], { step: 0 })).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// arithmetic overflow
// ---------------------------------------------------------------------------

describe('jacobianInto — arithmetic overflow는 RangeError이며 out을 수정하지 않는다', () => {
  test('central에서 fPlus=[MAX], fMinus=[-MAX] → subtraction overflow → RangeError', () => {
    const out: number[][] = [[9]];
    // baseline(1st), plus(2nd), minus(3rd) 순서로 호출된다.
    let call = 0;
    const f = (_x: readonly number[]): number[] => {
      const i = call++;
      if (i === 0) return [0];
      if (i === 1) return [Number.MAX_VALUE];
      return [-Number.MAX_VALUE];
    };
    expect(() => jacobianInto(out, f, [1], { method: 'central' })).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('forward에서 baseline=[-MAX], fPlus=[MAX] → subtraction overflow → RangeError', () => {
    const out: number[][] = [[9]];
    // baseline(call 0), plus(call 1). 호출 횟수 단언으로 분기 표류를 감지한다.
    let call = 0;
    const values = [[-Number.MAX_VALUE], [Number.MAX_VALUE]];
    const f = (_x: readonly number[]): readonly number[] => values[call++];
    expect(() => jacobianInto(out, f, [1], { method: 'forward' })).toThrow(RangeError);
    expect(out).toEqual([[9]]);
    expect(call).toBe(2);
  });

  test('backward에서 baseline=[MAX], fMinus=[-MAX] → subtraction overflow → RangeError', () => {
    const out: number[][] = [[9]];
    // baseline(call 0), minus(call 1). 호출 횟수 단언으로 분기 표류를 감지한다.
    let call = 0;
    const values = [[Number.MAX_VALUE], [-Number.MAX_VALUE]];
    const f = (_x: readonly number[]): readonly number[] => values[call++];
    expect(() => jacobianInto(out, f, [1], { method: 'backward' })).toThrow(RangeError);
    expect(out).toEqual([[9]]);
    expect(call).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// nested aliasing
// ---------------------------------------------------------------------------

describe('jacobianInto — nested aliasing 안전', () => {
  test('out[0]을 point로 그대로 넘겨도 결과가 정확하다 (perturb는 slice로 fresh array)', () => {
    const point: number[] = [2, 3];
    const out: number[][] = [point, []];
    const result = jacobianInto(out, fSumProd, point, { method: 'central', step: 1 });
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    // f([x,y]) = [x+y, x*y]; J = [[1,1],[y,x]] = [[1,1],[3,2]].
    expect(out[0][0]).toBeCloseTo(1, 6);
    expect(out[0][1]).toBeCloseTo(1, 6);
    expect(out[1][0]).toBeCloseTo(3, 6);
    expect(out[1][1]).toBeCloseTo(2, 6);
  });

  test('callback이 받은 perturbed point를 mutate해도 caller point는 그대로 유지된다', () => {
    const point: readonly number[] = [1, 2];
    const f = (x: readonly number[]): number[] => {
      (x as number[])[0] = 999;
      (x as number[])[1] = 999;
      return [x[0] + x[1]];
    };
    jacobianInto([], f, point, { method: 'central' });
    expect(point).toEqual([1, 2]);
  });
});

// ---------------------------------------------------------------------------
// signed-zero canonicalize
// ---------------------------------------------------------------------------

describe('jacobianInto — signed zero canonicalize', () => {
  test('constant f = () => [0, 0]의 Jacobian entry는 모두 +0이다', () => {
    const result = jacobianInto([], () => [0, 0], [1, 2, 3], { method: 'central' });
    for (const row of result) {
      for (const v of row) {
        expect(Object.is(v, 0)).toBe(true);
      }
    }
  });

  test('forward에서 fPlus === baseline인 constant도 +0으로 canonicalize된다', () => {
    const result = jacobianInto([], () => [5, -5], [0, 0], { method: 'forward' });
    for (const row of result) {
      for (const v of row) {
        expect(Object.is(v, 0)).toBe(true);
      }
    }
  });

  test('backward에서 baseline === fMinus인 constant도 +0으로 canonicalize된다', () => {
    const result = jacobianInto([], () => [-7, 7], [1, 1], { method: 'backward' });
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

describe('jacobianInto — 성공 시 out atomicity', () => {
  test('기존 row를 m으로 truncate하고 같은 out을 반환한다', () => {
    const out: number[][] = [
      [99, 99, 99],
      [99, 99, 99],
      [99, 99, 99],
      [99, 99, 99],
    ];
    const result = jacobianInto(out, fSumProd, [1, 1], { method: 'central', step: 1 });
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out[0]).toHaveLength(2);
    expect(out[1]).toHaveLength(2);
  });

  test('기존 out[r]가 array가 아니어도 새 row를 만들어 commit한다', () => {
    const out: number[][] = [];
    // 임의 비-array entry를 두기 위해 length만 늘려둔다.
    out.length = 5;
    const result = jacobianInto(out, fSumProd, [0, 0], { method: 'central', step: 1 });
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(Array.isArray(out[0])).toBe(true);
    expect(Array.isArray(out[1])).toBe(true);
  });
});
