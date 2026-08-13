/**
 * linalg forward triangular substitution unit test.
 *
 * solveByForwardSubstitution
 *   — 3x3 lower triangular forward substitution, empty matrix/vector, single row.
 *   — square 위반 / vector length mismatch / 비-삼각 upper non-zero → RangeError.
 *   — zero diagonal within epsilon → undefined.
 *   — invalid epsilon / non-finite matrix / non-finite vector → RangeError.
 *   — 누적 합/나눗셈 결과 non-finite → RangeError.
 * 공통: solution에 -0이 남지 않는다. 결과는 새 number[] 인스턴스다.
 */

import { describe, expect, test } from 'vitest';
import { solveByForwardSubstitution } from '../../../src/linalg/solve-by-forward-substitution';

describe('solveByForwardSubstitution — 정상 입력', () => {
  test('3x3 lower triangular 시스템 Lx = b를 푼다', () => {
    // L = [[2, 0, 0], [3, 1, 0], [1, -1, 4]], b = [4, 5, 6]
    // x[0] = 4 / 2 = 2
    // x[1] = (5 - 3 * 2) / 1 = -1
    // x[2] = (6 - 1 * 2 - (-1) * (-1)) / 4 = (6 - 2 - 1) / 4 = 0.75
    const result = solveByForwardSubstitution(
      [
        [2, 0, 0],
        [3, 1, 0],
        [1, -1, 4],
      ],
      [4, 5, 6]
    );
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result[0]).toBeCloseTo(2, 12);
    expect(result[1]).toBeCloseTo(-1, 12);
    expect(result[2]).toBeCloseTo(0.75, 12);
  });

  test('identity lower triangular은 b를 그대로 반환한다', () => {
    const result = solveByForwardSubstitution(
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
    expect(solveByForwardSubstitution([[2]], [10])).toEqual([5]);
  });

  test('empty matrix와 empty vector는 empty solution을 반환한다', () => {
    expect(solveByForwardSubstitution([], [])).toEqual([]);
  });

  test('upper 영역 entry가 정확히 0이면 lower triangular로 인정한다', () => {
    const result = solveByForwardSubstitution(
      [
        [1, 0],
        [2, 3],
      ],
      [1, 5]
    );
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result[0]).toBeCloseTo(1, 12);
    expect(result[1]).toBeCloseTo(1, 12);
  });

  test('upper 영역 entry가 epsilon 이하 noise이면 lower triangular로 인정한다', () => {
    const result = solveByForwardSubstitution(
      [
        [1, 1e-12],
        [2, 3],
      ],
      [1, 5]
    );
    expect(result).toBeDefined();
  });

  test('solution에 -0이 남지 않는다', () => {
    // x[0] = 0 / 2 = 0, x[1] = (0 - 3 * 0) / 1 = 0
    const result = solveByForwardSubstitution(
      [
        [2, 0],
        [-3, 1],
      ],
      [0, 0]
    );
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(Object.is(result[0], -0)).toBe(false);
    expect(Object.is(result[1], -0)).toBe(false);
  });

  test('새 number[] 인스턴스를 반환해 input vector 참조를 공유하지 않는다', () => {
    const b = [4, 5, 6];
    const result = solveByForwardSubstitution(
      [
        [2, 0, 0],
        [3, 1, 0],
        [1, -1, 4],
      ],
      b
    );
    expect(result).toBeDefined();
    if (result === undefined) return;
    b[0] = 999;
    expect(result[0]).toBeCloseTo(2, 12);
  });
});

describe('solveByForwardSubstitution — singular', () => {
  test('diagonal abs가 epsilon 이하이면 undefined를 반환한다', () => {
    expect(
      solveByForwardSubstitution(
        [
          [2, 0],
          [3, 0],
        ],
        [4, 5]
      )
    ).toBeUndefined();
  });

  test('custom epsilon 이하 diagonal noise도 singular로 본다', () => {
    expect(
      solveByForwardSubstitution(
        [
          [1e-6, 0],
          [3, 4],
        ],
        [1, 5],
        { epsilon: 1e-3 }
      )
    ).toBeUndefined();
  });
});

describe('solveByForwardSubstitution — validation', () => {
  test('non-square 행렬은 RangeError를 던진다', () => {
    expect(() =>
      solveByForwardSubstitution(
        [
          [1, 0, 0],
          [2, 3, 0],
        ],
        [1, 5]
      )
    ).toThrow(RangeError);
  });

  test('vector length가 row 수와 다르면 RangeError를 던진다', () => {
    expect(() =>
      solveByForwardSubstitution(
        [
          [1, 0],
          [2, 3],
        ],
        [1]
      )
    ).toThrow(RangeError);
  });

  test('upper 영역에 epsilon보다 큰 non-zero가 있으면 RangeError를 던진다', () => {
    expect(() =>
      solveByForwardSubstitution(
        [
          [1, 5],
          [2, 3],
        ],
        [1, 5]
      )
    ).toThrow(RangeError);
  });

  test('ragged matrix는 RangeError를 던진다', () => {
    expect(() => solveByForwardSubstitution([[1, 0], [2]], [1, 5])).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'matrix entry %s는 RangeError를 던진다',
    (bad) => {
      expect(() =>
        solveByForwardSubstitution(
          [
            [1, 0],
            [bad, 1],
          ],
          [1, 1]
        )
      ).toThrow(RangeError);
    }
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'vector entry %s는 RangeError를 던진다',
    (bad) => {
      expect(() =>
        solveByForwardSubstitution(
          [
            [1, 0],
            [0, 1],
          ],
          [bad, 1]
        )
      ).toThrow(RangeError);
    }
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('invalid epsilon %s는 RangeError를 던진다', (bad) => {
    expect(() => solveByForwardSubstitution([[1]], [1], { epsilon: bad })).toThrow(RangeError);
  });

  test('invalid epsilon은 다른 input 검증 전에 던진다', () => {
    expect(() => solveByForwardSubstitution([[1, 0], [2]], [1, 1], { epsilon: -1 })).toThrow(/epsilon/);
  });

  test('누적 sum 결과가 Infinity로 overflow되면 RangeError를 던진다', () => {
    const huge = Number.MAX_VALUE;
    expect(() =>
      solveByForwardSubstitution(
        [
          [1, 0],
          [-huge, 1],
        ],
        [huge, huge]
      )
    ).toThrow(RangeError);
  });
});
