/**
 * solveByGaussianElimination unit test.
 *
 * unique / overdetermined / underdetermined / inconsistent / empty / validation 분기를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { solveByGaussianElimination } from '../../../src/linalg/solve-by-gaussian-elimination';

describe('solveByGaussianElimination — unique (square)', () => {
  test('2x2 square unique solve로 해를 반환한다', () => {
    // A * x = b → [[2,1],[1,3]] x = [5,10], x = [1, 3]
    const result = solveByGaussianElimination(
      [
        [2, 1],
        [1, 3],
      ],
      [5, 10]
    );
    expect(result.type).toBe('unique');
    if (result.type !== 'unique') return;
    expect(result.solution[0]).toBeCloseTo(1, 12);
    expect(result.solution[1]).toBeCloseTo(3, 12);
  });

  test('1x1 unique solve로 b/A[0][0]을 반환한다', () => {
    const result = solveByGaussianElimination([[5]], [15]);
    expect(result.type).toBe('unique');
    if (result.type !== 'unique') return;
    expect(result.solution).toEqual([3]);
  });

  test('A[0][0]이 zero라도 partial pivoting으로 해를 찾는다', () => {
    // A = [[0,1],[1,0]], b=[3,5] → row swap 후 x=[5,3]
    const result = solveByGaussianElimination(
      [
        [0, 1],
        [1, 0],
      ],
      [3, 5]
    );
    expect(result.type).toBe('unique');
    if (result.type !== 'unique') return;
    expect(result.solution).toEqual([5, 3]);
  });

  test('3x3 identity 입력은 b를 그대로 반환한다', () => {
    const result = solveByGaussianElimination(
      [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      [4, -2, 7]
    );
    expect(result.type).toBe('unique');
    if (result.type !== 'unique') return;
    expect(result.solution).toEqual([4, -2, 7]);
  });

  test('solution에 -0이 남지 않는다', () => {
    // x[0] = 0, x[1] = 0이어야 하는 system에서 -0이 발생할 수 있는지 검증.
    const result = solveByGaussianElimination(
      [
        [1, 0],
        [0, 1],
      ],
      [-0, 0]
    );
    expect(result.type).toBe('unique');
    if (result.type !== 'unique') return;
    expect(result.solution[0]).toBe(0);
    expect(Object.is(result.solution[0], -0)).toBe(false);
    expect(result.solution[1]).toBe(0);
    expect(Object.is(result.solution[1], -0)).toBe(false);
  });

  test('새 number[] 인스턴스를 반환해 input b 참조를 공유하지 않는다', () => {
    const b = [3, 5];
    const result = solveByGaussianElimination(
      [
        [1, 0],
        [0, 1],
      ],
      b
    );
    expect(result.type).toBe('unique');
    if (result.type !== 'unique') return;
    b[0] = 999;
    expect(result.solution[0]).toBe(3);
  });
});

describe('solveByGaussianElimination — overdetermined (tall, full column rank)', () => {
  test('tall full-column-rank consistent system은 residual 0인 overdetermined를 반환한다', () => {
    // A 3x2, b ∈ Col(A) → unique solution, exact residual 0.
    const result = solveByGaussianElimination(
      [
        [1, 0],
        [0, 1],
        [1, 1],
      ],
      [2, 3, 5]
    );
    expect(result.type).toBe('overdetermined');
    if (result.type !== 'overdetermined') return;
    expect(result.solution).toEqual([2, 3]);
    expect(result.residual).toBe(0);
  });

  test('tall full-column-rank에서 epsilon 이하 잔차가 RREF에서 cleanup되면 unique 분류이지만 residual은 양수다', () => {
    // 마지막 row의 RHS noise(1e-10)는 default epsilon(1e-9) 이하로 RREF cleanup 대상.
    // RREF는 unique로 분류하지만 원본 A*x-b 잔차는 1e-10로 남는다.
    const result = solveByGaussianElimination(
      [
        [1, 0],
        [0, 1],
        [1, 1],
      ],
      [2, 3, 5 + 1e-10]
    );
    expect(result.type).toBe('overdetermined');
    if (result.type !== 'overdetermined') return;
    expect(result.solution).toEqual([2, 3]);
    expect(result.residual).toBeGreaterThan(0);
    expect(result.residual).toBeLessThan(1e-9);
  });

  test('overdetermined solution도 새 number[] 인스턴스다', () => {
    const b = [2, 3, 5];
    const result = solveByGaussianElimination(
      [
        [1, 0],
        [0, 1],
        [1, 1],
      ],
      b
    );
    expect(result.type).toBe('overdetermined');
    if (result.type !== 'overdetermined') return;
    b[0] = 999;
    expect(result.solution[0]).toBe(2);
  });
});

describe('solveByGaussianElimination — underdetermined', () => {
  test('wide rectangular system은 pivotColumns와 rref를 반환한다', () => {
    // A 2x3 full row rank, 3 unknowns → 1 free column.
    const result = solveByGaussianElimination(
      [
        [1, 0, 2],
        [0, 1, 4],
      ],
      [3, 5]
    );
    expect(result.type).toBe('underdetermined');
    if (result.type !== 'underdetermined') return;
    expect(result.pivotColumns).toEqual([0, 1]);
    expect(result.rref).toEqual([
      [1, 0, 2, 3],
      [0, 1, 4, 5],
    ]);
  });

  test('square rank-deficient system은 underdetermined 분류로 free column을 노출한다', () => {
    // [[1,2],[2,4]] x = [3,6]. 두 row가 비례하므로 rank 1.
    const result = solveByGaussianElimination(
      [
        [1, 2],
        [2, 4],
      ],
      [3, 6]
    );
    expect(result.type).toBe('underdetermined');
    if (result.type !== 'underdetermined') return;
    expect(result.pivotColumns).toEqual([0]);
  });

  test('underdetermined rref는 fresh deep copy다', () => {
    const A = [
      [1, 0, 2],
      [0, 1, 4],
    ];
    const result = solveByGaussianElimination(A, [3, 5]);
    expect(result.type).toBe('underdetermined');
    if (result.type !== 'underdetermined') return;
    A[0][0] = 999;
    expect(result.rref[0][0]).toBe(1);
  });
});

describe('solveByGaussianElimination — inconsistent', () => {
  test('square parallel rows + 다른 RHS는 inconsistent를 반환한다', () => {
    const result = solveByGaussianElimination(
      [
        [1, 0],
        [1, 0],
      ],
      [3, 5]
    );
    expect(result.type).toBe('inconsistent');
  });

  test('tall full-column-rank이라도 b ∉ Col(A)면 inconsistent로 분류된다', () => {
    // A=[[1],[1]] rank 1, b=[3,5]는 column space에 없다.
    const result = solveByGaussianElimination([[1], [1]], [3, 5]);
    expect(result.type).toBe('inconsistent');
  });

  test('inconsistent rref는 fresh deep copy다', () => {
    const A = [
      [1, 0],
      [1, 0],
    ];
    const result = solveByGaussianElimination(A, [3, 5]);
    expect(result.type).toBe('inconsistent');
    if (result.type !== 'inconsistent') return;
    A[0][0] = 999;
    expect(result.rref.length).toBe(2);
  });
});

describe('solveByGaussianElimination — empty', () => {
  test('A=[], b=[]는 unique empty solution을 반환한다', () => {
    const result = solveByGaussianElimination([], []);
    expect(result.type).toBe('unique');
    if (result.type !== 'unique') return;
    expect(result.solution).toEqual([]);
  });
});

describe('solveByGaussianElimination — validation', () => {
  test('A.rows !== b.length이면 RangeError를 던진다', () => {
    expect(() =>
      solveByGaussianElimination(
        [
          [1, 0],
          [0, 1],
        ],
        [1, 2, 3]
      )
    ).toThrow(RangeError);
  });

  test('ragged A는 RangeError를 던진다', () => {
    expect(() => solveByGaussianElimination([[1, 0], [0]], [1, 2])).toThrow(RangeError);
  });

  test('one-sided zero shape `[[]]`은 RangeError를 던진다', () => {
    expect(() => solveByGaussianElimination([[]], [0])).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'A에 non-finite entry %s가 있으면 RangeError를 던진다',
    (bad) => {
      expect(() =>
        solveByGaussianElimination(
          [
            [1, 0],
            [bad, 1],
          ],
          [1, 2]
        )
      ).toThrow(RangeError);
    }
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'b에 non-finite entry %s가 있으면 RangeError를 던진다',
    (bad) => {
      expect(() =>
        solveByGaussianElimination(
          [
            [1, 0],
            [0, 1],
          ],
          [1, bad]
        )
      ).toThrow(RangeError);
    }
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('invalid epsilon %s는 RangeError를 던진다', (bad) => {
    expect(() =>
      solveByGaussianElimination(
        [
          [1, 0],
          [0, 1],
        ],
        [1, 2],
        { epsilon: bad }
      )
    ).toThrow(RangeError);
  });

  test('invalid epsilon은 shape mismatch보다 먼저 throw한다', () => {
    expect(() =>
      solveByGaussianElimination(
        [
          [1, 0],
          [0, 1],
        ],
        [1, 2, 3],
        { epsilon: -1 }
      )
    ).toThrow(/epsilon/);
  });
});
