import { describe, expect, test } from 'vitest';
import { fitMinimumAreaRect } from '../../../src/fitting/fit-minimum-area-rect';
import { fitMinimumAreaRectInto } from '../../../src/fitting/fit-minimum-area-rect-into';

const NON_FINITE = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

function createOut() {
  return { center: { x: 0, y: 0 }, size: { x: 0, y: 0 }, angle: 0 };
}

describe('fitMinimumAreaRectInto', () => {
  test('axis-aligned rectangle는 center/size/angle을 그대로 복원한다', () => {
    const out = createOut();
    const result = fitMinimumAreaRectInto(out, [
      [0, 0],
      [2, 0],
      [2, 1],
      [0, 1],
    ]);
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 1, y: 0.5 });
    expect(out.size).toEqual({ x: 2, y: 1 });
    expect(out.angle).toBe(0);
  });

  test('내부 point와 duplicate point는 결과에 영향을 주지 않는다', () => {
    const out = createOut();
    fitMinimumAreaRectInto(out, [
      [0, 0],
      [2, 0],
      [2, 1],
      [0, 1],
      [1, 0.5],
      [0, 0],
      [2, 1],
    ]);
    expect(out.center).toEqual({ x: 1, y: 0.5 });
    expect(out.size).toEqual({ x: 2, y: 1 });
    expect(out.angle).toBe(0);
  });

  test('rotated rectangle는 minimal-area oriented rect를 복원한다', () => {
    // u=(0.8, 0.6), perp=(-0.6, 0.8), center (0,0), half-extent 2(along u), 1(perp). area 8.
    const out = createOut();
    fitMinimumAreaRectInto(out, [
      [1.0, 2.0],
      [2.2, 0.4],
      [-2.2, -0.4],
      [-1.0, -2.0],
    ]);
    // 4개 edge 모두 area 8 동률이며 float noise가 tie를 결정한다. 선택은 길이축(0.8,0.6) edge다.
    expect(out.center.x).toBeCloseTo(0, 12);
    expect(out.center.y).toBeCloseTo(0, 12);
    expect(out.size.x * out.size.y).toBeCloseTo(8, 12);
    expect([out.size.x, out.size.y].sort((a, b) => a - b)).toEqual([expect.closeTo(2, 12), expect.closeTo(4, 12)]);
    expect(out.size.x).toBeCloseTo(4, 12);
    expect(out.size.y).toBeCloseTo(2, 12);
    expect(out.angle).toBeCloseTo(Math.atan2(0.6, 0.8), 12);
  });

  test('tuple input과 object input을 모두 받는다', () => {
    const tupleOut = createOut();
    fitMinimumAreaRectInto(tupleOut, [
      [0, 0],
      [2, 0],
      [2, 1],
      [0, 1],
    ]);
    const objectOut = createOut();
    fitMinimumAreaRectInto(objectOut, [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 0, y: 1 },
    ]);
    expect(objectOut).toEqual(tupleOut);
  });

  test('square의 tie-break는 먼저 발견한 hull edge(angle 0)를 유지한다', () => {
    const out = createOut();
    fitMinimumAreaRectInto(out, [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]);
    expect(out.center).toEqual({ x: 0.5, y: 0.5 });
    expect(out.size).toEqual({ x: 1, y: 1 });
    expect(out.angle).toBe(0);
  });

  test('out.center가 input point와 aliasing되어도 결과가 안정적이다', () => {
    const shared = { x: 0, y: 0 };
    const out = { center: shared, size: { x: 0, y: 0 }, angle: 0 };
    const result = fitMinimumAreaRectInto(out, [shared, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 0, y: 1 }]);
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 1, y: 0.5 });
    expect(out.size).toEqual({ x: 2, y: 1 });
    expect(out.angle).toBe(0);
  });

  test('out.size가 input point와 aliasing되어도 결과가 안정적이다', () => {
    const shared = { x: 0, y: 0 };
    const out = { center: { x: 0, y: 0 }, size: shared, angle: 0 };
    const result = fitMinimumAreaRectInto(out, [shared, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 0, y: 1 }]);
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 1, y: 0.5 });
    expect(out.size).toEqual({ x: 2, y: 1 });
    expect(out.angle).toBe(0);
  });

  test('정확히 3개 unique non-collinear point(삼각형)는 양수 size oriented rect를 만든다', () => {
    const out = createOut();
    const result = fitMinimumAreaRectInto(out, [
      [0, 0],
      [1, 0],
      [0, 1],
    ]);
    expect(result).toBe(out);
    expect(out.size.x).toBeGreaterThan(0);
    expect(out.size.y).toBeGreaterThan(0);
    expect(Number.isFinite(out.center.x)).toBe(true);
    expect(Number.isFinite(out.center.y)).toBe(true);
    expect(Number.isFinite(out.angle)).toBe(true);
  });

  test('unique point가 3 미만이면 false이고 out을 수정하지 않는다', () => {
    const out = createOut();
    expect(
      fitMinimumAreaRectInto(out, [
        [0, 0],
        [1, 1],
      ])
    ).toBe(false);
    expect(out).toEqual(createOut());
  });

  test('duplicate 제거 후 unique point가 3 미만이면 false이고 out을 수정하지 않는다', () => {
    const out = createOut();
    expect(
      fitMinimumAreaRectInto(out, [
        [0, 0],
        [0, 0],
        [1, 1],
        [1, 1],
      ])
    ).toBe(false);
    expect(out).toEqual(createOut());
  });

  test('collinear point set은 false이고 out을 수정하지 않는다', () => {
    const out = createOut();
    expect(
      fitMinimumAreaRectInto(out, [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
      ])
    ).toBe(false);
    expect(out).toEqual(createOut());
  });

  test('큰 epsilon은 얇은 rectangle을 degenerate로 실패 처리한다', () => {
    const out = createOut();
    expect(
      fitMinimumAreaRectInto(
        out,
        [
          [0, 0],
          [10, 0],
          [10, 0.001],
          [0, 0.001],
        ],
        { epsilon: 0.01 }
      )
    ).toBe(false);
    expect(out).toEqual(createOut());
  });

  test.each(NON_FINITE)('non-finite point x 좌표 %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      fitMinimumAreaRectInto(out, [
        [bad, 0],
        [2, 0],
        [2, 1],
        [0, 1],
      ])
    ).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point y 좌표 %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      fitMinimumAreaRectInto(out, [
        [0, bad],
        [2, 0],
        [2, 1],
        [0, 1],
      ])
    ).toThrow(RangeError);
  });

  test.each([...NON_FINITE, -1])('invalid epsilon %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      fitMinimumAreaRectInto(
        out,
        [
          [0, 0],
          [2, 0],
          [2, 1],
          [0, 1],
        ],
        { epsilon: bad }
      )
    ).toThrow(RangeError);
  });

  test('axis-aligned 결과의 zero component는 -0이 아니라 +0이다', () => {
    const out = createOut();
    fitMinimumAreaRectInto(out, [
      [-1, -0.5],
      [1, -0.5],
      [1, 0.5],
      [-1, 0.5],
    ]);
    expect(Object.is(out.center.x, -0)).toBe(false);
    expect(Object.is(out.center.y, -0)).toBe(false);
    expect(Object.is(out.angle, -0)).toBe(false);
    expect(out.center).toEqual({ x: 0, y: 0 });
    expect(out.size).toEqual({ x: 2, y: 1 });
    expect(out.angle).toBe(0);
  });
});

describe('fitMinimumAreaRect', () => {
  test('성공 시 plain oriented rect object를 반환한다', () => {
    const result = fitMinimumAreaRect([
      [0, 0],
      [2, 0],
      [2, 1],
      [0, 1],
    ]);
    expect(result).toEqual({ center: { x: 1, y: 0.5 }, size: { x: 2, y: 1 }, angle: 0 });
  });

  test('collinear point set은 undefined를 반환한다', () => {
    expect(
      fitMinimumAreaRect([
        [0, 0],
        [1, 1],
        [2, 2],
      ])
    ).toBeUndefined();
  });

  test('degenerate extent는 undefined를 반환한다', () => {
    expect(
      fitMinimumAreaRect(
        [
          [0, 0],
          [10, 0],
          [10, 0.001],
          [0, 0.001],
        ],
        { epsilon: 0.01 }
      )
    ).toBeUndefined();
  });

  test('non-finite point는 RangeError다', () => {
    expect(() =>
      fitMinimumAreaRect([
        [Number.NaN, 0],
        [2, 0],
        [2, 1],
        [0, 1],
      ])
    ).toThrow(RangeError);
  });
});
