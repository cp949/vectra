/**
 * vec interpolation alias 단위 테스트.
 *
 * lerpInto/midpointInto/moveTowardInto 및 각 companion을 검증한다.
 */

import { describe, expect, expectTypeOf, test } from 'vitest';
import type { XYWritable } from '../../../src/types';
import { lerpInto } from '../../../src/vec/lerp-into';
import { midpointInto } from '../../../src/vec/midpoint-into';
import { moveToward } from '../../../src/vec/move-toward';
import { moveTowardInto } from '../../../src/vec/move-toward-into';

// --- vec interpolation alias 테스트 ---

describe('vec interpolation alias - lerpInto', () => {
  test('a와 b 사이를 t로 보간한 벡터를 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = lerpInto(out, { x: 0, y: 0 }, { x: 4, y: 6 }, 0.5);
    expect(result).toBe(out);
    expect(out).toEqual({ x: 2, y: 3 });
  });

  test('tuple input을 처리한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    lerpInto(out, [0, 0], [10, 20], 0.5);
    expect(out).toEqual({ x: 5, y: 10 });
  });

  test('mutable tuple out에 결과를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = lerpInto(out, { x: 0, y: 0 }, { x: 4, y: 6 }, 0.5);
    expect(result).toBe(out);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });

  test('out === a aliasing에서도 올바른 결과를 반환한다', () => {
    const pt: { x: number; y: number } = { x: 0, y: 0 };
    lerpInto(pt, pt, { x: 4, y: 6 }, 0.5);
    expect(pt).toEqual({ x: 2, y: 3 });
  });

  test('t를 clamp하지 않고 extrapolation을 허용한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    lerpInto(out, { x: 0, y: 0 }, { x: 4, y: 6 }, 2);
    expect(out).toEqual({ x: 8, y: 12 });
  });

  test('finite하지 않은 input은 RangeError를 던진다', () => {
    expect(() => lerpInto({ x: 0, y: 0 }, { x: NaN, y: 0 }, { x: 1, y: 1 }, 0.5)).toThrow(RangeError);
    expect(() => lerpInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 }, NaN)).toThrow(RangeError);
  });
});

describe('vec interpolation alias - midpointInto', () => {
  test('a와 b의 중점을 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = midpointInto(out, { x: 0, y: 0 }, { x: 4, y: 6 });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 2, y: 3 });
  });

  test('tuple input을 처리한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    midpointInto(out, [0, 0], [10, 20]);
    expect(out).toEqual({ x: 5, y: 10 });
  });

  test('finite하지 않은 input은 RangeError를 던진다', () => {
    expect(() => midpointInto({ x: 0, y: 0 }, { x: NaN, y: 0 }, { x: 1, y: 1 })).toThrow(RangeError);
  });
});

describe('vec interpolation alias - moveTowardInto', () => {
  test('current를 target 방향으로 maxDistance만큼 이동한 결과를 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    // distance = 5 (3-4-5 삼각형), maxDistance = 10 → target 도달
    const result = moveTowardInto(out, { x: 0, y: 0 }, { x: 3, y: 4 }, 10);
    expect(result).toBe(out);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('maxDistance만큼만 이동한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    moveTowardInto(out, { x: 0, y: 0 }, { x: 10, y: 0 }, 5);
    expect(out.x).toBeCloseTo(5, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('음수 maxDistance는 RangeError를 던진다', () => {
    expect(() => moveTowardInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 5, y: 0 }, -1)).toThrow(RangeError);
  });

  test('finite하지 않은 input은 RangeError를 던진다', () => {
    expect(() => moveTowardInto({ x: 0, y: 0 }, { x: NaN, y: 0 }, { x: 5, y: 0 }, 1)).toThrow(RangeError);
  });
});

describe('vec interpolation alias - moveToward', () => {
  test('current를 target 방향으로 이동한 새 object를 반환한다', () => {
    const result = moveToward({ x: 0, y: 0 }, { x: 3, y: 4 }, 10);
    expect(result).toEqual({ x: 3, y: 4 });
  });
});
