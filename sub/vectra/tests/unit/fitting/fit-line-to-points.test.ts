import { describe, expect, test } from 'vitest';
import { fitLineToPoints } from '../../../src/fitting/fit-line-to-points';
import { fitLineToPointsInto } from '../../../src/fitting/fit-line-to-points-into';

const NON_FINITE = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

function createOut() {
  return { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };
}

describe('fitLineToPointsInto', () => {
  test('horizontal point cloud는 centroid origin과 (1, 0) direction을 반환한다', () => {
    const out = createOut();
    const result = fitLineToPointsInto(out, [
      [0, 4],
      [2, 4],
      [4, 4],
    ]);
    expect(result).toBe(out);
    expect(out.origin).toEqual({ x: 2, y: 4 });
    expect(out.direction).toEqual({ x: 1, y: 0 });
  });

  test('vertical point cloud는 centroid origin과 (0, 1) direction을 반환한다', () => {
    const out = createOut();
    fitLineToPointsInto(out, [
      [3, 0],
      [3, 2],
      [3, 4],
    ]);
    expect(out.origin).toEqual({ x: 3, y: 2 });
    expect(out.direction).toEqual({ x: 0, y: 1 });
  });

  test('diagonal point cloud는 unit direction과 centroid origin을 반환한다', () => {
    const out = createOut();
    fitLineToPointsInto(out, [
      [0, 0],
      [1, 1],
      [2, 2],
    ]);
    const half = Math.SQRT1_2;
    expect(out.origin).toEqual({ x: 1, y: 1 });
    expect(out.direction.x).toBeCloseTo(half, 12);
    expect(out.direction.y).toBeCloseTo(half, 12);
    expect(Math.hypot(out.direction.x, out.direction.y)).toBeCloseTo(1, 12);
  });

  test('sample count가 2 미만이면 false이고 out을 수정하지 않는다', () => {
    const out = createOut();
    expect(fitLineToPointsInto(out, [[1, 2]])).toBe(false);
    expect(out).toEqual(createOut());
  });

  test('모든 point가 같으면 false이고 out을 수정하지 않는다', () => {
    const out = createOut();
    expect(
      fitLineToPointsInto(out, [
        [5, 5],
        [5, 5],
      ])
    ).toBe(false);
    expect(out).toEqual(createOut());
  });

  test.each(NON_FINITE)('non-finite point x 좌표 %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      fitLineToPointsInto(out, [
        [bad, 0],
        [1, 1],
      ])
    ).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point y 좌표 %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      fitLineToPointsInto(out, [
        [0, bad],
        [1, 1],
      ])
    ).toThrow(RangeError);
  });

  test('음수 epsilon은 RangeError다', () => {
    const out = createOut();
    expect(() =>
      fitLineToPointsInto(
        out,
        [
          [0, 0],
          [1, 0],
        ],
        { epsilon: -1 }
      )
    ).toThrow(RangeError);
  });

  test('centroid의 0 component는 -0이 아니라 +0이다', () => {
    const out = createOut();
    // mean x = 0. -0 cleanup 검증.
    fitLineToPointsInto(out, [
      [-1, 4],
      [1, 4],
    ]);
    expect(Object.is(out.origin.x, -0)).toBe(false);
    expect(out.origin).toEqual({ x: 0, y: 4 });
  });

  test.each(NON_FINITE)('invalid epsilon %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      fitLineToPointsInto(
        out,
        [
          [0, 0],
          [1, 0],
        ],
        { epsilon: bad }
      )
    ).toThrow(RangeError);
  });

  test('out.origin이 input point와 aliasing되어도 결과가 안정적이다', () => {
    const shared = { x: 0, y: 4 };
    const out = { origin: shared, direction: { x: 0, y: 0 } };
    const result = fitLineToPointsInto(out, [shared, { x: 2, y: 4 }, { x: 4, y: 4 }]);
    expect(result).toBe(out);
    expect(out.origin).toEqual({ x: 2, y: 4 });
    expect(out.direction).toEqual({ x: 1, y: 0 });
  });
});

describe('fitLineToPoints', () => {
  test('성공 시 plain object를 반환한다', () => {
    const result = fitLineToPoints([
      [0, 0],
      [2, 0],
      [4, 0],
    ]);
    expect(result).toEqual({ origin: { x: 2, y: 0 }, direction: { x: 1, y: 0 } });
  });

  test('실패 시 undefined를 반환한다', () => {
    expect(fitLineToPoints([[1, 1]])).toBeUndefined();
    expect(
      fitLineToPoints([
        [3, 3],
        [3, 3],
      ])
    ).toBeUndefined();
  });

  test('non-finite 입력은 RangeError다', () => {
    expect(() =>
      fitLineToPoints([
        [Number.NaN, 0],
        [1, 1],
      ])
    ).toThrow(RangeError);
  });
});
