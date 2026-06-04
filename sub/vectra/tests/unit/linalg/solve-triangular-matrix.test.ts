/**
 * solveTriangularMatrix unit test.
 *
 * 정상 입력:
 *   — 3x3 lower triangular forward substitution, 3x3 upper triangular backward substitution.
 *   — empty matrix/vector `[]`은 양쪽 triangle 모두 empty solution.
 *   — lower/upper identity는 b를 그대로 반환한다.
 *   — 결과에 `-0`이 남지 않는다(Object.is로 검증).
 *   — input vector 참조를 공유하지 않는다.
 *
 * singular:
 *   — diagonal abs <= epsilon → undefined.
 *   — custom epsilon 이하 diagonal noise도 singular로 본다.
 *
 * validation:
 *   — invalid triangle('foo', undefined, null, 123) → RangeError.
 *   — non-square / b.length mismatch / 비-삼각 영역 non-zero → RangeError.
 *   — invalid epsilon(NaN, Infinity, -1) → RangeError.
 *   — 누적 sum / division overflow → RangeError.
 *   — non-finite matrix entry / vector entry → RangeError.
 *   — 검증 순서: epsilon → triangle → matrix.
 */

import { describe, expect, test } from 'vitest';
import { solveTriangularMatrix } from '../../../src/linalg/solve-triangular-matrix';

describe('solveTriangularMatrix — 정상 입력', () => {
  test("triangle='lower'은 3x3 lower triangular 시스템 Lx = b를 푼다", () => {
    // L = [[2, 0, 0], [3, 1, 0], [1, -1, 4]], b = [4, 5, 6]
    // x[0] = 4 / 2 = 2
    // x[1] = (5 - 3 * 2) / 1 = -1
    // x[2] = (6 - 1 * 2 - (-1) * (-1)) / 4 = (6 - 2 - 1) / 4 = 0.75
    const result = solveTriangularMatrix(
      [
        [2, 0, 0],
        [3, 1, 0],
        [1, -1, 4],
      ],
      [4, 5, 6],
      'lower'
    );
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result[0]).toBeCloseTo(2, 12);
    expect(result[1]).toBeCloseTo(-1, 12);
    expect(result[2]).toBeCloseTo(0.75, 12);
  });

  test("triangle='upper'는 3x3 upper triangular 시스템 Ux = b를 푼다", () => {
    // U = [[2, 1, -1], [0, 1, 2], [0, 0, 4]], b = [3, 4, 8]
    // x[2] = 8 / 4 = 2
    // x[1] = (4 - 2 * 2) / 1 = 0
    // x[0] = (3 - 1 * 0 - (-1) * 2) / 2 = (3 + 2) / 2 = 2.5
    const result = solveTriangularMatrix(
      [
        [2, 1, -1],
        [0, 1, 2],
        [0, 0, 4],
      ],
      [3, 4, 8],
      'upper'
    );
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result[0]).toBeCloseTo(2.5, 12);
    expect(result[1]).toBeCloseTo(0, 12);
    expect(result[2]).toBeCloseTo(2, 12);
  });

  test("triangle='lower'은 1x1 행렬 [[a]] x = [b]에 대해 [b/a]를 반환한다", () => {
    expect(solveTriangularMatrix([[2]], [10], 'lower')).toEqual([5]);
  });

  test("triangle='upper'는 1x1 행렬 [[a]] x = [b]에 대해 [b/a]를 반환한다", () => {
    expect(solveTriangularMatrix([[2]], [10], 'upper')).toEqual([5]);
  });

  test("triangle='lower'에서 empty matrix/vector는 empty solution을 반환한다", () => {
    expect(solveTriangularMatrix([], [], 'lower')).toEqual([]);
  });

  test("triangle='upper'에서 empty matrix/vector는 empty solution을 반환한다", () => {
    expect(solveTriangularMatrix([], [], 'upper')).toEqual([]);
  });

  test("triangle='lower'에서 lower identity는 b를 그대로 반환한다", () => {
    expect(
      solveTriangularMatrix(
        [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ],
        [7, -3, 5],
        'lower'
      )
    ).toEqual([7, -3, 5]);
  });

  test("triangle='upper'에서 upper identity는 b를 그대로 반환한다", () => {
    expect(
      solveTriangularMatrix(
        [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ],
        [7, -3, 5],
        'upper'
      )
    ).toEqual([7, -3, 5]);
  });

  test("triangle='lower' 결과에 -0이 남지 않는다", () => {
    const result = solveTriangularMatrix(
      [
        [2, 0],
        [-3, 1],
      ],
      [0, 0],
      'lower'
    );
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(Object.is(result[0], -0)).toBe(false);
    expect(Object.is(result[1], -0)).toBe(false);
    expect(Object.is(result[0], 0)).toBe(true);
    expect(Object.is(result[1], 0)).toBe(true);
  });

  test("triangle='upper' 결과에 -0이 남지 않는다", () => {
    const result = solveTriangularMatrix(
      [
        [1, 2],
        [0, -3],
      ],
      [0, 0],
      'upper'
    );
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(Object.is(result[0], -0)).toBe(false);
    expect(Object.is(result[1], -0)).toBe(false);
    expect(Object.is(result[0], 0)).toBe(true);
    expect(Object.is(result[1], 0)).toBe(true);
  });

  test('새 number[] 인스턴스를 반환해 input vector 참조를 공유하지 않는다', () => {
    const b = [4, 5, 6];
    const result = solveTriangularMatrix(
      [
        [2, 0, 0],
        [3, 1, 0],
        [1, -1, 4],
      ],
      b,
      'lower'
    );
    expect(result).toBeDefined();
    if (result === undefined) return;
    b[0] = 999;
    expect(result[0]).toBeCloseTo(2, 12);
  });
});

describe('solveTriangularMatrix — singular', () => {
  test("triangle='lower'에서 diagonal abs가 epsilon 이하이면 undefined", () => {
    expect(
      solveTriangularMatrix(
        [
          [2, 0],
          [3, 0],
        ],
        [4, 5],
        'lower'
      )
    ).toBeUndefined();
  });

  test("triangle='upper'에서 diagonal abs가 epsilon 이하이면 undefined", () => {
    expect(
      solveTriangularMatrix(
        [
          [2, 3],
          [0, 0],
        ],
        [4, 5],
        'upper'
      )
    ).toBeUndefined();
  });

  test('custom epsilon 이하 diagonal noise도 singular로 본다', () => {
    expect(
      solveTriangularMatrix(
        [
          [1e-6, 0],
          [3, 4],
        ],
        [1, 5],
        'lower',
        { epsilon: 1e-3 }
      )
    ).toBeUndefined();
  });
});

describe('solveTriangularMatrix — validation', () => {
  test.each([
    'foo' as unknown as 'lower',
    '' as unknown as 'lower',
    'LOWER' as unknown as 'lower',
    'Upper' as unknown as 'lower',
    undefined as unknown as 'lower',
    null as unknown as 'lower',
    123 as unknown as 'lower',
    {} as unknown as 'lower',
    [] as unknown as 'lower',
  ])('invalid triangle %p는 RangeError를 던진다', (bad) => {
    expect(() => solveTriangularMatrix([[1]], [1], bad)).toThrow(RangeError);
  });

  test('invalid triangle 에러 메시지는 triangle 인자 이름을 포함한다', () => {
    expect(() => solveTriangularMatrix([[1]], [1], 'foo' as unknown as 'lower')).toThrow(/triangle/);
  });

  test('non-square 행렬은 RangeError를 던진다', () => {
    expect(() =>
      solveTriangularMatrix(
        [
          [1, 0, 0],
          [2, 3, 0],
        ],
        [1, 5],
        'lower'
      )
    ).toThrow(RangeError);
  });

  test("triangle='upper'에서도 non-square 행렬은 RangeError를 던진다", () => {
    expect(() =>
      solveTriangularMatrix(
        [
          [1, 2, 3],
          [0, 4, 5],
        ],
        [1, 5],
        'upper'
      )
    ).toThrow(RangeError);
  });

  test("triangle='lower'에서 vector length가 row 수와 다르면 RangeError를 던진다", () => {
    expect(() =>
      solveTriangularMatrix(
        [
          [1, 0],
          [2, 3],
        ],
        [1],
        'lower'
      )
    ).toThrow(RangeError);
  });

  test("triangle='upper'에서 vector length가 row 수와 다르면 RangeError를 던진다", () => {
    expect(() =>
      solveTriangularMatrix(
        [
          [1, 2],
          [0, 3],
        ],
        [1],
        'upper'
      )
    ).toThrow(RangeError);
  });

  test("triangle='lower'에서 upper 영역에 epsilon보다 큰 non-zero가 있으면 RangeError", () => {
    expect(() =>
      solveTriangularMatrix(
        [
          [1, 5],
          [2, 3],
        ],
        [1, 5],
        'lower'
      )
    ).toThrow(RangeError);
  });

  test("triangle='upper'에서 lower 영역에 epsilon보다 큰 non-zero가 있으면 RangeError", () => {
    expect(() =>
      solveTriangularMatrix(
        [
          [1, 2],
          [5, 3],
        ],
        [1, 5],
        'upper'
      )
    ).toThrow(RangeError);
  });

  test('ragged matrix는 RangeError를 던진다', () => {
    expect(() => solveTriangularMatrix([[1, 0], [2]], [1, 5], 'lower')).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])("triangle='lower' matrix entry %s는 RangeError를 던진다", (bad) => {
    expect(() =>
      solveTriangularMatrix(
        [
          [1, 0],
          [bad, 1],
        ],
        [1, 1],
        'lower'
      )
    ).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])("triangle='upper' matrix entry %s는 RangeError를 던진다", (bad) => {
    expect(() =>
      solveTriangularMatrix(
        [
          [1, bad],
          [0, 1],
        ],
        [1, 1],
        'upper'
      )
    ).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])("triangle='lower' vector entry %s는 RangeError를 던진다", (bad) => {
    expect(() =>
      solveTriangularMatrix(
        [
          [1, 0],
          [0, 1],
        ],
        [bad, 1],
        'lower'
      )
    ).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('invalid epsilon %s는 RangeError를 던진다', (bad) => {
    expect(() => solveTriangularMatrix([[1]], [1], 'lower', { epsilon: bad })).toThrow(RangeError);
  });

  test('invalid epsilon은 triangle 검증 전에 던진다', () => {
    expect(() => solveTriangularMatrix([[1]], [1], 'foo' as unknown as 'lower', { epsilon: -1 })).toThrow(/epsilon/);
  });

  test('invalid triangle은 matrix 검증 전에 던진다', () => {
    // matrix가 ragged지만 triangle이 먼저 검증되어야 한다.
    expect(() => solveTriangularMatrix([[1, 0], [2]], [1, 1], 'foo' as unknown as 'lower')).toThrow(/triangle/);
  });

  test("triangle='lower' 누적 sum overflow는 RangeError를 던진다", () => {
    const huge = Number.MAX_VALUE;
    expect(() =>
      solveTriangularMatrix(
        [
          [1, 0],
          [-huge, 1],
        ],
        [huge, huge],
        'lower'
      )
    ).toThrow(RangeError);
  });

  test("triangle='upper' 누적 sum overflow는 RangeError를 던진다", () => {
    const huge = Number.MAX_VALUE;
    expect(() =>
      solveTriangularMatrix(
        [
          [1, -huge],
          [0, 1],
        ],
        [huge, huge],
        'upper'
      )
    ).toThrow(RangeError);
  });

  test('division 결과 overflow는 RangeError를 던진다', () => {
    // diagonal이 (epsilon보다 크면서) 작아 sum / diagonal이 Infinity가 된다.
    const huge = Number.MAX_VALUE;
    expect(() => solveTriangularMatrix([[0.5]], [huge], 'lower')).toThrow(RangeError);
  });
});
