import { describe, expect, test } from 'vitest';
import { fitCircleToPoints } from '../../../src/fitting/fit-circle-to-points';
import { fitCircleToPointsInto } from '../../../src/fitting/fit-circle-to-points-into';

const NON_FINITE = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

function createOut() {
  return { center: { x: 0, y: 0 }, radius: 0 };
}

describe('fitCircleToPointsInto', () => {
  test('세 점 exact circle은 정확한 center/radius를 반환한다', () => {
    const out = createOut();
    const result = fitCircleToPointsInto(out, [
      [1, 0],
      [0, 1],
      [-1, 0],
    ]);
    expect(result).toBe(out);
    expect(out.center.x).toBeCloseTo(0, 12);
    expect(out.center.y).toBeCloseTo(0, 12);
    expect(out.radius).toBeCloseTo(1, 12);
  });

  test('네 점 이상 circle은 overdetermined fit으로 같은 center/radius를 반환한다', () => {
    const out = createOut();
    fitCircleToPointsInto(out, [
      [7, 3],
      [-3, 3],
      [2, 8],
      [2, -2],
    ]);
    expect(out.center.x).toBeCloseTo(2, 9);
    expect(out.center.y).toBeCloseTo(3, 9);
    expect(out.radius).toBeCloseTo(5, 9);
  });

  test('horizontal로 치우친 sample도 정상 처리한다', () => {
    const out = createOut();
    // center (0, 0), radius 5 위의 점들. y가 작은 영역에 치우침.
    const result = fitCircleToPointsInto(out, [
      [5, 0],
      [-5, 0],
      [4, 3],
      [-4, 3],
    ]);
    expect(result).toBe(out);
    expect(out.center.x).toBeCloseTo(0, 9);
    expect(out.center.y).toBeCloseTo(0, 9);
    expect(out.radius).toBeCloseTo(5, 9);
  });

  test('sample count가 3 미만이면 false이고 out을 수정하지 않는다', () => {
    const out = createOut();
    expect(
      fitCircleToPointsInto(out, [
        [0, 0],
        [1, 1],
      ])
    ).toBe(false);
    expect(out).toEqual(createOut());
  });

  test('collinear point는 false이고 out을 수정하지 않는다', () => {
    const out = createOut();
    expect(
      fitCircleToPointsInto(out, [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
      ])
    ).toBe(false);
    expect(out).toEqual(createOut());
  });

  test('duplicate-heavy rank-deficient point set은 false다', () => {
    const out = createOut();
    expect(
      fitCircleToPointsInto(out, [
        [0, 0],
        [0, 0],
        [1, 1],
      ])
    ).toBe(false);
    expect(out).toEqual(createOut());
  });

  test('큰 좌표의 작은 원도 정확히 fit한다 (centroid 평행이동)', () => {
    const out = createOut();
    // center (1e6, 1e6), radius 0.001 위의 4점. 평행이동 없으면 cancellation으로 singular.
    const cx = 1e6;
    const cy = 1e6;
    const r = 0.001;
    const result = fitCircleToPointsInto(out, [
      [cx + r, cy],
      [cx - r, cy],
      [cx, cy + r],
      [cx, cy - r],
    ]);
    expect(result).toBe(out);
    expect(out.center.x).toBeCloseTo(cx, 6);
    expect(out.center.y).toBeCloseTo(cy, 6);
    expect(out.radius).toBeCloseTo(r, 9);
  });

  test('radius²가 epsilon 이하이면 false다', () => {
    const out = createOut();
    // unit circle 위 3점, epsilon=2 → radius²=1 <= 2 → false. epsilon이 radius 판정에 쓰임을 검증.
    expect(
      fitCircleToPointsInto(
        out,
        [
          [1, 0],
          [0, 1],
          [-1, 0],
        ],
        { epsilon: 2 }
      )
    ).toBe(false);
    expect(out).toEqual(createOut());
  });

  test('center의 0 component는 -0이 아니라 +0이다', () => {
    const out = createOut();
    // center (0, 0). -0 cleanup 검증.
    fitCircleToPointsInto(out, [
      [1, 0],
      [0, 1],
      [-1, 0],
    ]);
    expect(Object.is(out.center.x, -0)).toBe(false);
    expect(Object.is(out.center.y, -0)).toBe(false);
  });

  test.each(NON_FINITE)('non-finite point x 좌표 %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      fitCircleToPointsInto(out, [
        [bad, 0],
        [0, 1],
        [1, 0],
      ])
    ).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point y 좌표 %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      fitCircleToPointsInto(out, [
        [0, bad],
        [0, 1],
        [1, 0],
      ])
    ).toThrow(RangeError);
  });

  test('음수 epsilon은 RangeError다', () => {
    const out = createOut();
    expect(() =>
      fitCircleToPointsInto(
        out,
        [
          [1, 0],
          [0, 1],
          [-1, 0],
        ],
        { epsilon: -1 }
      )
    ).toThrow(RangeError);
  });

  test.each(NON_FINITE)('invalid epsilon %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      fitCircleToPointsInto(
        out,
        [
          [1, 0],
          [0, 1],
          [-1, 0],
        ],
        { epsilon: bad }
      )
    ).toThrow(RangeError);
  });

  test('out.center가 input point와 aliasing되어도 결과가 안정적이다', () => {
    const shared = { x: 1, y: 0 };
    const out = { center: shared, radius: 0 };
    const result = fitCircleToPointsInto(out, [shared, { x: 0, y: 1 }, { x: -1, y: 0 }]);
    expect(result).toBe(out);
    expect(out.center.x).toBeCloseTo(0, 12);
    expect(out.center.y).toBeCloseTo(0, 12);
    expect(out.radius).toBeCloseTo(1, 12);
  });

  test('tuple writable center에도 결과를 기록한다', () => {
    const out = { center: [0, 0] as [number, number], radius: 0 };
    const result = fitCircleToPointsInto(out, [
      [3, 1],
      [1, 3],
      [-1, 1],
      [1, -1],
    ]);
    expect(result).toBe(out);
    expect(out.center[0]).toBeCloseTo(1, 12);
    expect(out.center[1]).toBeCloseTo(1, 12);
    expect(out.radius).toBeCloseTo(2, 12);
  });
});

describe('fitCircleToPoints', () => {
  test('성공 시 plain object를 반환한다', () => {
    const result = fitCircleToPoints([
      [1, 0],
      [0, 1],
      [-1, 0],
    ]);
    expect(result).toBeDefined();
    expect(result?.center.x).toBeCloseTo(0, 12);
    expect(result?.center.y).toBeCloseTo(0, 12);
    expect(result?.radius).toBeCloseTo(1, 12);
  });

  test('실패 시 undefined를 반환한다', () => {
    expect(
      fitCircleToPoints([
        [0, 0],
        [1, 1],
      ])
    ).toBeUndefined();
    expect(
      fitCircleToPoints([
        [0, 0],
        [1, 1],
        [2, 2],
      ])
    ).toBeUndefined();
  });

  test('non-finite 입력은 RangeError다', () => {
    expect(() =>
      fitCircleToPoints([
        [Number.NaN, 0],
        [0, 1],
        [1, 0],
      ])
    ).toThrow(RangeError);
  });
});
