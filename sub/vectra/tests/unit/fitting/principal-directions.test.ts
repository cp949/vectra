import { describe, expect, test } from 'vitest';
import { principalDirections } from '../../../src/fitting/principal-directions';
import { principalDirectionsInto } from '../../../src/fitting/principal-directions-into';

const NON_FINITE = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

function createOut() {
  return { primary: { x: 0, y: 0 }, secondary: { x: 0, y: 0 } };
}

describe('principalDirectionsInto', () => {
  test('x축 방향 point cloud는 primary (1, 0), secondary (0, 1)을 기록한다', () => {
    const out = createOut();
    const result = principalDirectionsInto(out, [
      [-2, 0],
      [-1, 0],
      [1, 0],
      [2, 0],
    ]);
    expect(result).toBe(out);
    expect(out.primary).toEqual({ x: 1, y: 0 });
    expect(out.secondary).toEqual({ x: 0, y: 1 });
  });

  test('y축 방향 point cloud는 primary (0, 1), secondary (1, 0)을 기록한다', () => {
    const out = createOut();
    principalDirectionsInto(out, [
      [0, -2],
      [0, -1],
      [0, 1],
      [0, 2],
    ]);
    expect(out.primary).toEqual({ x: 0, y: 1 });
    // perpendicular (-1, 0)을 canonicalize → (1, 0)
    expect(out.secondary).toEqual({ x: 1, y: 0 });
  });

  test('diagonal point cloud는 unit-length orthonormal axis를 반환한다', () => {
    const out = createOut();
    principalDirectionsInto(out, [
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
    ]);
    const half = Math.SQRT1_2;
    expect(out.primary.x).toBeCloseTo(half, 12);
    expect(out.primary.y).toBeCloseTo(half, 12);
    // unit length
    expect(Math.hypot(out.primary.x, out.primary.y)).toBeCloseTo(1, 12);
    expect(Math.hypot(out.secondary.x, out.secondary.y)).toBeCloseTo(1, 12);
    // 직교
    expect(out.primary.x * out.secondary.x + out.primary.y * out.secondary.y).toBeCloseTo(0, 12);
    // secondary 첫 strict non-zero component는 양수
    expect(out.secondary.x).toBeGreaterThan(0);
  });

  test('sample count가 2 미만이면 false이고 out을 수정하지 않는다', () => {
    const out = createOut();
    expect(principalDirectionsInto(out, [[1, 2]])).toBe(false);
    expect(out).toEqual(createOut());
  });

  test('모든 point가 같은 위치이면 false이고 out을 수정하지 않는다', () => {
    const out = createOut();
    expect(
      principalDirectionsInto(out, [
        [5, 5],
        [5, 5],
        [5, 5],
      ])
    ).toBe(false);
    expect(out).toEqual(createOut());
  });

  test('total variance가 epsilon 이하이면 false다', () => {
    const out = createOut();
    expect(
      principalDirectionsInto(
        out,
        [
          [0, 0],
          [1, 0],
        ],
        { epsilon: 1 }
      )
    ).toBe(false);
    expect(out).toEqual(createOut());
  });

  test.each(NON_FINITE)('non-finite point x 좌표 %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      principalDirectionsInto(out, [
        [bad, 0],
        [1, 1],
      ])
    ).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point y 좌표 %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      principalDirectionsInto(out, [
        [0, bad],
        [1, 1],
      ])
    ).toThrow(RangeError);
  });

  test.each(NON_FINITE)('invalid epsilon %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      principalDirectionsInto(
        out,
        [
          [0, 0],
          [1, 0],
        ],
        { epsilon: bad }
      )
    ).toThrow(RangeError);
  });

  test('음수 epsilon은 RangeError다', () => {
    const out = createOut();
    expect(() =>
      principalDirectionsInto(
        out,
        [
          [0, 0],
          [1, 0],
        ],
        { epsilon: -1 }
      )
    ).toThrow(RangeError);
  });

  test('anti-diagonal cloud는 primary x>0, y<0 unit axis를 반환한다 (sxy<0 경로)', () => {
    const out = createOut();
    // sxy < 0 분기. canonicalize는 x>0를 유지하고 y는 음수가 된다.
    principalDirectionsInto(out, [
      [0, 0],
      [-1, 1],
      [-2, 2],
    ]);
    const half = Math.SQRT1_2;
    expect(out.primary.x).toBeCloseTo(half, 12);
    expect(out.primary.y).toBeCloseTo(-half, 12);
    // secondary는 primary에 직교하고 첫 strict non-zero component가 양수다.
    expect(out.primary.x * out.secondary.x + out.primary.y * out.secondary.y).toBeCloseTo(0, 12);
    expect(out.secondary.x).toBeGreaterThan(0);
  });

  test('canonicalize한 0 component는 -0이 아니라 +0이다', () => {
    const out = createOut();
    // x축 cloud → primary (1, 0), secondary (0, 1). 0 component가 -0이 아님을 보장한다.
    principalDirectionsInto(out, [
      [-1, 0],
      [1, 0],
    ]);
    expect(Object.is(out.primary.y, -0)).toBe(false);
    expect(Object.is(out.secondary.x, -0)).toBe(false);
    // y축 cloud → secondary raw (-1, 0) → flip → (1, -0); -0 cleanup 검증.
    const out2 = createOut();
    principalDirectionsInto(out2, [
      [0, -1],
      [0, 1],
    ]);
    expect(Object.is(out2.secondary.y, -0)).toBe(false);
  });

  test('epsilon 0은 허용되고 variance가 strict 양수이면 성공한다', () => {
    const out = createOut();
    expect(
      principalDirectionsInto(
        out,
        [
          [0, 0],
          [1, 0],
        ],
        { epsilon: 0 }
      )
    ).toBe(out);
    expect(out.primary).toEqual({ x: 1, y: 0 });
  });

  test('out.primary가 input point와 aliasing되어도 결과가 안정적이다', () => {
    const shared = { x: 2, y: 0 };
    const out = { primary: shared, secondary: { x: 0, y: 0 } };
    const result = principalDirectionsInto(out, [{ x: -2, y: 0 }, { x: -1, y: 0 }, shared, { x: 1, y: 0 }]);
    expect(result).toBe(out);
    expect(out.primary).toEqual({ x: 1, y: 0 });
    expect(out.secondary).toEqual({ x: 0, y: 1 });
  });
});

describe('principalDirections', () => {
  test('성공 시 plain object를 반환한다', () => {
    const result = principalDirections([
      [-2, 0],
      [2, 0],
    ]);
    expect(result).toEqual({ primary: { x: 1, y: 0 }, secondary: { x: 0, y: 1 } });
  });

  test('실패 시 undefined를 반환한다', () => {
    expect(principalDirections([[1, 1]])).toBeUndefined();
    expect(
      principalDirections([
        [3, 3],
        [3, 3],
      ])
    ).toBeUndefined();
  });

  test('non-finite 입력은 RangeError다', () => {
    expect(() =>
      principalDirections([
        [Number.NaN, 0],
        [1, 1],
      ])
    ).toThrow(RangeError);
  });
});
