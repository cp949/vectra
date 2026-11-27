/** 점 모음 피팅의 계산 결과와 실패 조건을 검증한다. */
import { describe, expect, test } from 'vitest';
import { fitLineToPoints } from '../../../src/fitting/fit-line-to-points';
import { fitLineToPointsInto } from '../../../src/fitting/fit-line-to-points-into';

const NON_FINITE = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

/** 피팅 결과를 기록할 초기 출력 객체를 만든다. */
function createOut() {
  return { ox: 0, oy: 0, dx: 0, dy: 0 };
}

describe('fitLineToPointsInto', () => {
  test('horizontal point cloud는 centroid origin과 (1, 0) direction을 반환한다', () => {
    const out = createOut();
    const result = fitLineToPointsInto(out, [
      { x: 0, y: 4 },
      { x: 2, y: 4 },
      { x: 4, y: 4 },
    ]);
    expect(result).toBe(out);
    expect(out.ox).toBe(2);
    expect(out.oy).toBe(4);
    expect(out.dx).toBe(1);
    expect(out.dy).toBe(0);
  });

  test('vertical point cloud는 centroid origin과 (0, 1) direction을 반환한다', () => {
    const out = createOut();
    fitLineToPointsInto(out, [
      { x: 3, y: 0 },
      { x: 3, y: 2 },
      { x: 3, y: 4 },
    ]);
    expect(out.ox).toBe(3);
    expect(out.oy).toBe(2);
    expect(out.dx).toBe(0);
    expect(out.dy).toBe(1);
  });

  test('diagonal point cloud는 unit direction과 centroid origin을 반환한다', () => {
    const out = createOut();
    fitLineToPointsInto(out, [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]);
    const half = Math.SQRT1_2;
    expect(out.ox).toBe(1);
    expect(out.oy).toBe(1);
    expect(out.dx).toBeCloseTo(half, 12);
    expect(out.dy).toBeCloseTo(half, 12);
    expect(Math.hypot(out.dx, out.dy)).toBeCloseTo(1, 12);
  });

  test('sample count가 2 미만이면 false이고 out을 수정하지 않는다', () => {
    const out = createOut();
    expect(fitLineToPointsInto(out, [{ x: 1, y: 2 }])).toBe(false);
    expect(out).toEqual(createOut());
  });

  test('모든 point가 같으면 false이고 out을 수정하지 않는다', () => {
    const out = createOut();
    expect(
      fitLineToPointsInto(out, [
        { x: 5, y: 5 },
        { x: 5, y: 5 },
      ])
    ).toBe(false);
    expect(out).toEqual(createOut());
  });

  test.each(NON_FINITE)('non-finite point x 좌표 %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      fitLineToPointsInto(out, [
        { x: bad, y: 0 },
        { x: 1, y: 1 },
      ])
    ).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point y 좌표 %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      fitLineToPointsInto(out, [
        { x: 0, y: bad },
        { x: 1, y: 1 },
      ])
    ).toThrow(RangeError);
  });

  test('음수 epsilon은 RangeError다', () => {
    const out = createOut();
    expect(() =>
      fitLineToPointsInto(
        out,
        [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        { epsilon: -1 }
      )
    ).toThrow(RangeError);
  });

  test('centroid의 0 component는 -0이 아니라 +0이다', () => {
    const out = createOut();
    // mean x = 0. -0 cleanup 검증.
    fitLineToPointsInto(out, [
      { x: -1, y: 4 },
      { x: 1, y: 4 },
    ]);
    expect(Object.is(out.ox, -0)).toBe(false);
    expect(out.ox).toBe(0);
    expect(out.oy).toBe(4);
  });

  test.each(NON_FINITE)('invalid epsilon %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      fitLineToPointsInto(
        out,
        [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        { epsilon: bad }
      )
    ).toThrow(RangeError);
  });
});

describe('fitLineToPoints', () => {
  test('성공 시 plain object를 반환한다', () => {
    const result = fitLineToPoints([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 4, y: 0 },
    ]);
    expect(result).toEqual({ ox: 2, oy: 0, dx: 1, dy: 0 });
  });

  test('실패 시 undefined를 반환한다', () => {
    expect(fitLineToPoints([{ x: 1, y: 1 }])).toBeUndefined();
    expect(
      fitLineToPoints([
        { x: 3, y: 3 },
        { x: 3, y: 3 },
      ])
    ).toBeUndefined();
  });

  test('non-finite 입력은 RangeError다', () => {
    expect(() =>
      fitLineToPoints([
        { x: Number.NaN, y: 0 },
        { x: 1, y: 1 },
      ])
    ).toThrow(RangeError);
  });
});
