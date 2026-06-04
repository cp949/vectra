/**
 * infinite-line projection 단위 테스트.
 *
 * projectionT, projectPoint(Into)의 unclamped t 반환과 수선의 발 계산,
 * non-normalized direction 처리, degenerate 입력 거동, mutable tuple out 지원을
 * 함께 다룬다.
 */
import { describe, expect, expectTypeOf, test } from 'vitest';
import { projectPoint } from '../../../src/infinite-line/project-point';
import { projectPointInto } from '../../../src/infinite-line/project-point-into';
import { projectionT } from '../../../src/infinite-line/projection-t';
import type { XYWritable } from '../../../src/types';

describe('infinite-line projection - projectionT', () => {
  test('수평 infinite-line 위 point의 t를 unclamped로 반환한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    expect(projectionT(line, { x: 2, y: 0 })).toBe(0.5);
  });

  test('infinite-line 앞 point는 t < 0을 unclamped로 반환한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    expect(projectionT(line, { x: -2, y: 0 })).toBe(-0.5);
  });

  test('infinite-line 뒤 point는 t > 1을 unclamped로 반환한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    expect(projectionT(line, { x: 8, y: 0 })).toBe(2);
  });

  test('수직 offset은 t에 영향을 주지 않는다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    expect(projectionT(line, { x: 2, y: 5 })).toBe(0.5);
  });

  test('non-normalized direction에서도 caller가 넘긴 scale 기준 t를 반환한다', () => {
    // direction = (10, 0)일 때 (5, 0)은 t = 0.5이다
    const line = { origin: { x: 0, y: 0 }, direction: { x: 10, y: 0 } };
    expect(projectionT(line, { x: 5, y: 0 })).toBe(0.5);
  });

  test('degenerate infinite-line은 0을 반환한다', () => {
    const line = { origin: { x: 3, y: 4 }, direction: { x: 0, y: 0 } };
    expect(projectionT(line, { x: 10, y: 20 })).toBe(0);
  });

  test('tuple infinite-line input을 읽는다', () => {
    expect(
      projectionT(
        [
          [0, 0],
          [4, 0],
        ] as const,
        [2, 0]
      )
    ).toBe(0.5);
  });
});

describe('infinite-line projection - projectPointInto / projectPoint', () => {
  test('수선의 발을 unclamped로 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = projectPointInto(out, { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } }, { x: 2, y: 3 });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 2, y: 0 });
  });

  test('t < 0 case도 clamp하지 않는다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    projectPointInto(out, { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } }, { x: -2, y: 5 });
    expect(out).toEqual({ x: -2, y: 0 });
  });

  test('t > 1 case도 clamp하지 않는다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    projectPointInto(out, { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } }, { x: 10, y: 5 });
    expect(out).toEqual({ x: 10, y: 0 });
  });

  test('non-normalized direction에서도 정확한 수선의 발을 계산한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    // direction=(3,4), point=(3,0) → t = 9/25, foot = (27/25, 36/25) = (1.08, 1.44)
    projectPointInto(out, { origin: { x: 0, y: 0 }, direction: { x: 3, y: 4 } }, { x: 3, y: 0 });
    expect(out.x).toBeCloseTo(1.08, 10);
    expect(out.y).toBeCloseTo(1.44, 10);
  });

  test('degenerate infinite-line의 projectPointInto는 origin을 기록한다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    projectPointInto(out, { origin: { x: 3, y: 4 }, direction: { x: 0, y: 0 } }, { x: 100, y: 200 });
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('mutable tuple out에도 기록할 수 있다', () => {
    const out: [number, number] = [0, 0];
    const result = projectPointInto(out, { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } }, { x: 2, y: 3 });
    expect(result).toBe(out);
    expect(out).toEqual([2, 0]);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });

  test('projectPoint companion이 새 plain object를 반환한다', () => {
    const p = projectPoint({ origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } }, { x: 2, y: 3 });
    expect(p).toEqual({ x: 2, y: 0 });
  });
});
