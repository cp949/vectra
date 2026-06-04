/**
 * linalg backward triangular substitution unit test.
 *
 * solveByBackwardSubstitution
 *   — 3x3 upper triangular backward substitution, empty matrix/vector, single row.
 *   — square 위반 / vector length mismatch / 비-삼각 lower non-zero → RangeError.
 *   — zero diagonal within epsilon → undefined.
 *   — invalid epsilon / non-finite matrix / non-finite vector → RangeError.
 *   — 누적 합 결과 non-finite → RangeError.
 *
 * 공통: solution에 -0이 남지 않는다. 결과는 새 number[] 인스턴스다.
 */

import { describe, expect, test } from 'vitest';
import { solveByBackwardSubstitution } from '../../../src/linalg/solve-by-backward-substitution';

describe('solveByBackwardSubstitution — 정상 입력', () => {
  test('3x3 upper triangular 시스템 Ux = b를 푼다', () => {
    // U = [[2, 1, -1], [0, 1, 2], [0, 0, 4]], b = [3, 4, 8]
    // x[2] = 8 / 4 = 2
    // x[1] = (4 - 2 * 2) / 1 = 0
    // x[0] = (3 - 1 * 0 - (-1) * 2) / 2 = (3 + 2) / 2 = 2.5
    const result = solveByBackwardSubstitution(
      [
        [2, 1, -1],
        [0, 1, 2],
        [0, 0, 4],
      ],
      [3, 4, 8]
    );
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result[0]).toBeCloseTo(2.5, 12);
    expect(result[1]).toBeCloseTo(0, 12);
    expect(result[2]).toBeCloseTo(2, 12);
  });

  test('identity upper triangular은 b를 그대로 반환한다', () => {
    const result = solveByBackwardSubstitution(
      [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      [7, -3, 5]
    );
    expect(result).toEqual([7, -3, 5]);
  });

  test('1x1 행렬 [[a]] x = [b]는 [b/a]를 반환한다', () => {
    expect(solveByBackwardSubstitution([[2]], [10])).toEqual([5]);
  });

  test('empty matrix와 empty vector는 empty solution을 반환한다', () => {
    expect(solveByBackwardSubstitution([], [])).toEqual([]);
  });

  test('lower 영역 entry가 epsilon 이하 noise이면 upper triangular로 인정한다', () => {
    const result = solveByBackwardSubstitution(
      [
        [1, 2],
        [1e-12, 3],
      ],
      [5, 6]
    );
    expect(result).toBeDefined();
  });

  test('solution에 -0이 남지 않는다', () => {
    const result = solveByBackwardSubstitution(
      [
        [1, 2],
        [0, -3],
      ],
      [0, 0]
    );
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(Object.is(result[0], -0)).toBe(false);
    expect(Object.is(result[1], -0)).toBe(false);
  });
});

describe('solveByBackwardSubstitution — singular', () => {
  test('diagonal abs가 epsilon 이하이면 undefined를 반환한다', () => {
    expect(
      solveByBackwardSubstitution(
        [
          [2, 3],
          [0, 0],
        ],
        [4, 5]
      )
    ).toBeUndefined();
  });
});

describe('solveByBackwardSubstitution — validation', () => {
  test('non-square 행렬은 RangeError를 던진다', () => {
    expect(() =>
      solveByBackwardSubstitution(
        [
          [1, 2, 3],
          [0, 4, 5],
        ],
        [1, 5]
      )
    ).toThrow(RangeError);
  });

  test('vector length가 row 수와 다르면 RangeError를 던진다', () => {
    expect(() =>
      solveByBackwardSubstitution(
        [
          [1, 2],
          [0, 3],
        ],
        [1]
      )
    ).toThrow(RangeError);
  });

  test('lower 영역에 epsilon보다 큰 non-zero가 있으면 RangeError를 던진다', () => {
    expect(() =>
      solveByBackwardSubstitution(
        [
          [1, 2],
          [5, 3],
        ],
        [1, 5]
      )
    ).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('matrix entry %s는 RangeError를 던진다', (bad) => {
    expect(() =>
      solveByBackwardSubstitution(
        [
          [1, bad],
          [0, 1],
        ],
        [1, 1]
      )
    ).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY])('invalid epsilon %s는 RangeError를 던진다', (bad) => {
    expect(() => solveByBackwardSubstitution([[1]], [1], { epsilon: bad })).toThrow(RangeError);
  });

  test('누적 sum 결과가 Infinity로 overflow되면 RangeError를 던진다', () => {
    const huge = Number.MAX_VALUE;
    expect(() =>
      solveByBackwardSubstitution(
        [
          [1, -huge],
          [0, 1],
        ],
        [huge, huge]
      )
    ).toThrow(RangeError);
  });
});
