/**
 * vec direction/normal helper 단위 테스트.
 *
 * directionToInto/normalLeftInto/normalRightInto 및 각 companion을 검증한다.
 */

import { describe, expect, expectTypeOf, test } from 'vitest';
import type { XYWritable } from '../../../src/types';
import { directionTo } from '../../../src/vec/direction-to';
import { directionToInto } from '../../../src/vec/direction-to-into';
import { normalLeft } from '../../../src/vec/normal-left';
import { normalLeftInto } from '../../../src/vec/normal-left-into';
import { normalRight } from '../../../src/vec/normal-right';
import { normalRightInto } from '../../../src/vec/normal-right-into';

// --- directionToInto / directionTo ---

describe('vec direction - directionToInto', () => {
  test('object input: (0,0)→(3,4) 방향 단위 벡터 (0.6, 0.8)을 out에 기록한다', () => {
    // 3-4-5 직각삼각형: dx=3, dy=4, len=5 → (0.6, 0.8)
    const out: XYWritable = { x: 0, y: 0 };

    const result = directionToInto(out, { x: 0, y: 0 }, { x: 3, y: 4 });

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(0.6, 10);
    expect(out.y).toBeCloseTo(0.8, 10);
  });

  test('tuple input: (0,0)→(3,4) 방향 단위 벡터를 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    directionToInto(out, [0, 0], [3, 4]);

    expect(out.x).toBeCloseTo(0.6, 10);
    expect(out.y).toBeCloseTo(0.8, 10);
  });

  test('같은 점 (from === to 값)에서 (0, 0)을 기록하고 throw하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };

    const result = directionToInto(out, { x: 5, y: 3 }, { x: 5, y: 3 });

    expect(result).toBe(out);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  test('origin이 아닌 non-zero from에서 방향 단위 벡터를 올바르게 기록한다', () => {
    // from=(1,1), to=(4,5): dx=3, dy=4, len=5 → (0.6, 0.8)
    const out: XYWritable = { x: 0, y: 0 };

    directionToInto(out, { x: 1, y: 1 }, { x: 4, y: 5 });

    expect(out.x).toBeCloseTo(0.6, 10);
    expect(out.y).toBeCloseTo(0.8, 10);
  });

  test('out === from self-aliasing에서도 올바른 결과를 반환한다', () => {
    // from과 out이 같은 object이면 dx/dy를 미리 읽어야 올바른 결과가 나온다
    const vec: XYWritable = { x: 0, y: 0 };

    directionToInto(vec, vec, { x: 3, y: 4 });

    expect(vec.x).toBeCloseTo(0.6, 10);
    expect(vec.y).toBeCloseTo(0.8, 10);
  });

  test('mutable tuple out에 결과를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = directionToInto(out, { x: 0, y: 0 }, [3, 4]);

    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(0.6, 10);
    expect(out[1]).toBeCloseTo(0.8, 10);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });

  test('NaN 입력은 JavaScript 산술 결과를 out에 기록한다', () => {
    // NaN을 포함한 산술은 NaN을 전파한다
    const out: XYWritable = { x: 0, y: 0 };

    directionToInto(out, { x: NaN, y: 0 }, { x: 3, y: 4 });

    expect(Number.isNaN(out.x) || Number.isNaN(out.y)).toBe(true);
  });

  test('Infinity 입력은 JavaScript 산술 결과를 out에 기록한다', () => {
    // dx=Infinity, len=hypot(Infinity,0)=Infinity → dx/len=NaN, dy/len=0
    const out: XYWritable = { x: 0, y: 0 };

    directionToInto(out, { x: 0, y: 0 }, { x: Infinity, y: 0 });

    expect(Number.isNaN(out.x)).toBe(true);
    expect(out.y).toBe(0);
  });

  test('out === to self-aliasing에서도 올바른 결과를 반환한다', () => {
    // to와 out이 같은 object이면 to 값을 먼저 읽어야 올바른 결과가 나온다
    const vec: XYWritable = { x: 3, y: 4 };

    directionToInto(vec, { x: 0, y: 0 }, vec);

    expect(vec.x).toBeCloseTo(0.6, 10);
    expect(vec.y).toBeCloseTo(0.8, 10);
  });
});

describe('vec companion - directionTo', () => {
  test('(0,0)→(3,4) 방향 단위 벡터를 새 object로 반환한다', () => {
    const result = directionTo({ x: 0, y: 0 }, { x: 3, y: 4 });

    expect(result).toEqual({ x: 0.6, y: 0.8 });
  });

  test('directionToInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    directionToInto(out, [1, 2], [4, 6]);
    const result = directionTo([1, 2], [4, 6]);

    expect(result.x).toBeCloseTo(out.x, 10);
    expect(result.y).toBeCloseTo(out.y, 10);
  });

  test('새로운 object를 반환하고 input을 mutate하지 않는다', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 3, y: 4 };
    const result = directionTo(from, to);

    expect(result).not.toBe(from);
    expect(result).not.toBe(to);
    expect(from).toEqual({ x: 0, y: 0 });
    expect(to).toEqual({ x: 3, y: 4 });
  });

  test('같은 점에서 { x: 0, y: 0 }을 반환하고 throw하지 않는다', () => {
    const result = directionTo({ x: 2, y: 3 }, { x: 2, y: 3 });

    expect(result).toEqual({ x: 0, y: 0 });
  });
});

// --- normalLeftInto / normalLeft ---

describe('vec direction - normalLeftInto', () => {
  test('object input: (3,4) CCW normal (-0.8, 0.6)을 out에 기록한다', () => {
    // (-y, x) = (-4, 3), len=5 → (-0.8, 0.6)
    const out: XYWritable = { x: 0, y: 0 };

    const result = normalLeftInto(out, { x: 3, y: 4 });

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(-0.8, 10);
    expect(out.y).toBeCloseTo(0.6, 10);
  });

  test('tuple input: (3,4) CCW normal을 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    normalLeftInto(out, [3, 4]);

    expect(out.x).toBeCloseTo(-0.8, 10);
    expect(out.y).toBeCloseTo(0.6, 10);
  });

  test('zero vector 입력에서 (0, 0)을 기록하고 throw하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };

    const result = normalLeftInto(out, { x: 0, y: 0 });

    expect(result).toBe(out);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  test('out === input self-aliasing에서도 올바른 결과를 반환한다', () => {
    const vec: XYWritable = { x: 3, y: 4 };

    normalLeftInto(vec, vec);

    expect(vec.x).toBeCloseTo(-0.8, 10);
    expect(vec.y).toBeCloseTo(0.6, 10);
  });

  test('mutable tuple out에 결과를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = normalLeftInto(out, { x: 3, y: 4 });

    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(-0.8, 10);
    expect(out[1]).toBeCloseTo(0.6, 10);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });

  test('NaN 입력은 JavaScript 산술 결과를 out에 기록한다', () => {
    // x=NaN, y=0 → nx=-0, ny=NaN, len=NaN → out.x=NaN, out.y=NaN
    const out: XYWritable = { x: 0, y: 0 };

    normalLeftInto(out, { x: NaN, y: 0 });

    expect(Number.isNaN(out.x)).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);
  });

  test('Infinity 입력은 JavaScript 산술 결과를 out에 기록한다', () => {
    // x=Infinity, y=0 → nx=-0, ny=Infinity, len=Infinity → out.x=-0/Infinity=-0, out.y=Infinity/Infinity=NaN
    const out: XYWritable = { x: 0, y: 0 };

    normalLeftInto(out, { x: Infinity, y: 0 });

    expect(Object.is(out.x, -0) || out.x === 0).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);
  });
});

describe('vec companion - normalLeft', () => {
  test('(3,4) CCW normal (-0.8, 0.6)을 새 object로 반환한다', () => {
    const result = normalLeft({ x: 3, y: 4 });

    expect(result.x).toBeCloseTo(-0.8, 10);
    expect(result.y).toBeCloseTo(0.6, 10);
  });

  test('normalLeftInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    normalLeftInto(out, [5, 12]);
    const result = normalLeft([5, 12]);

    expect(result.x).toBeCloseTo(out.x, 10);
    expect(result.y).toBeCloseTo(out.y, 10);
  });

  test('새로운 object를 반환하고 input을 mutate하지 않는다', () => {
    const input = { x: 3, y: 4 };
    const result = normalLeft(input);

    expect(result).not.toBe(input);
    expect(input).toEqual({ x: 3, y: 4 });
  });

  test('zero vector에서 { x: 0, y: 0 }을 반환하고 throw하지 않는다', () => {
    const result = normalLeft({ x: 0, y: 0 });

    expect(result).toEqual({ x: 0, y: 0 });
  });
});

// --- normalRightInto / normalRight ---

describe('vec direction - normalRightInto', () => {
  test('object input: (3,4) CW normal (0.8, -0.6)을 out에 기록한다', () => {
    // (y, -x) = (4, -3), len=5 → (0.8, -0.6)
    const out: XYWritable = { x: 0, y: 0 };

    const result = normalRightInto(out, { x: 3, y: 4 });

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(0.8, 10);
    expect(out.y).toBeCloseTo(-0.6, 10);
  });

  test('tuple input: (3,4) CW normal을 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    normalRightInto(out, [3, 4]);

    expect(out.x).toBeCloseTo(0.8, 10);
    expect(out.y).toBeCloseTo(-0.6, 10);
  });

  test('zero vector 입력에서 (0, 0)을 기록하고 throw하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };

    const result = normalRightInto(out, { x: 0, y: 0 });

    expect(result).toBe(out);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  test('out === input self-aliasing에서도 올바른 결과를 반환한다', () => {
    const vec: XYWritable = { x: 3, y: 4 };

    normalRightInto(vec, vec);

    expect(vec.x).toBeCloseTo(0.8, 10);
    expect(vec.y).toBeCloseTo(-0.6, 10);
  });

  test('mutable tuple out에 결과를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = normalRightInto(out, { x: 3, y: 4 });

    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(0.8, 10);
    expect(out[1]).toBeCloseTo(-0.6, 10);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });

  test('NaN 입력은 JavaScript 산술 결과를 out에 기록한다', () => {
    // x=NaN, y=0 → nx=0, ny=-NaN=NaN, len=NaN → out.x=NaN, out.y=NaN
    const out: XYWritable = { x: 0, y: 0 };

    normalRightInto(out, { x: NaN, y: 0 });

    expect(Number.isNaN(out.x)).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);
  });

  test('Infinity 입력은 JavaScript 산술 결과를 out에 기록한다', () => {
    // x=Infinity, y=0 → nx=0, ny=-Infinity, len=Infinity → out.x=0/Infinity=0, out.y=-Infinity/Infinity=NaN
    const out: XYWritable = { x: 0, y: 0 };

    normalRightInto(out, { x: Infinity, y: 0 });

    expect(out.x).toBe(0);
    expect(Number.isNaN(out.y)).toBe(true);
  });
});

describe('vec companion - normalRight', () => {
  test('(3,4) CW normal (0.8, -0.6)을 새 object로 반환한다', () => {
    const result = normalRight({ x: 3, y: 4 });

    expect(result.x).toBeCloseTo(0.8, 10);
    expect(result.y).toBeCloseTo(-0.6, 10);
  });

  test('normalRightInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    normalRightInto(out, [5, 12]);
    const result = normalRight([5, 12]);

    expect(result.x).toBeCloseTo(out.x, 10);
    expect(result.y).toBeCloseTo(out.y, 10);
  });

  test('새로운 object를 반환하고 input을 mutate하지 않는다', () => {
    const input = { x: 3, y: 4 };
    const result = normalRight(input);

    expect(result).not.toBe(input);
    expect(input).toEqual({ x: 3, y: 4 });
  });

  test('zero vector에서 { x: 0, y: 0 }을 반환하고 throw하지 않는다', () => {
    const result = normalRight({ x: 0, y: 0 });

    expect(result).toEqual({ x: 0, y: 0 });
  });
});
