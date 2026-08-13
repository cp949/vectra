/**
 * linalg LU factorization unit test.
 *
 * luDecomposition
 *   — 2x2 / 3x3 nonsingular Doolittle factorization, P*A near L*U.
 *   — partial pivoting permutation과 swaps count.
 *   — L diagonal 1, L upper 영역 0; U lower 영역 0; `-0` 미보존(off-diagonal/upper 양쪽).
 *   — singular pivot → undefined (default/custom epsilon).
 *   — empty matrix `[]` → `{ lower: [], upper: [], permutation: [], swaps: 0 }`.
 *   — validation: non-square, ragged, one-sided `[[]]`, non-finite entry, invalid epsilon, epsilon 우선.
 *   — overflow result(factor * row[j] 차감이 Infinity) → RangeError.
 *   — input matrix 참조 비공유: 결과 mutate가 input에 영향을 주지 않는다.
 */

import { describe, expect, test } from 'vitest';
import { luDecomposition } from '../../../src/linalg/lu-decomposition';
import { multiplyMatrices } from '../../../src/linalg/multiply-matrices';

/**
 * permutation 벡터로 원본 matrix의 행을 재배열한 P*A를 만든다.
 *
 * 각 row의 fresh shallow copy를 모은다. 본 helper는 test 내부에서 P*A와 L*U near equality
 * 비교를 위해 사용한다.
 */
function permuteRows(matrix: readonly (readonly number[])[], permutation: readonly number[]): number[][] {
  return permutation.map((p) => matrix[p].slice());
}

/**
 * 두 matrix가 element-wise로 가까운지 검증한다.
 *
 * shape는 동일하다고 가정한다(caller가 shape를 확보). `toBeCloseTo`의 precision 인자를 통해
 * digit 단위 허용 오차를 지정한다.
 */
function expectMatrixCloseTo(
  actual: readonly (readonly number[])[],
  expected: readonly (readonly number[])[],
  precision = 10
): void {
  expect(actual.length).toBe(expected.length);
  for (let r = 0; r < expected.length; r++) {
    const aRow = actual[r];
    const eRow = expected[r];
    expect(aRow.length).toBe(eRow.length);
    for (let c = 0; c < eRow.length; c++) {
      expect(aRow[c]).toBeCloseTo(eRow[c], precision);
    }
  }
}

describe('luDecomposition — 정상 입력', () => {
  test('2x2 nonsingular matrix는 lower/upper/permutation/swaps를 반환한다', () => {
    // A = [[4, 3], [6, 3]]. partial pivoting → row swap 후 처리.
    const A = [
      [4, 3],
      [6, 3],
    ];
    const result = luDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.swaps).toBe(1);
    expect(result.permutation).toEqual([1, 0]);
    expect(result.lower[0][0]).toBe(1);
    expect(result.lower[1][1]).toBe(1);
    expect(result.lower[0][1]).toBe(0);
    expectMatrixCloseTo(multiplyMatrices(result.lower, result.upper), permuteRows(A, result.permutation));
  });

  test('이미 pivot 위치가 최적이면 swaps는 0이다', () => {
    // A = [[2, 1], [1, 3]]. abs(A[0][0])=2 > abs(A[1][0])=1 → swap 없음.
    const A = [
      [2, 1],
      [1, 3],
    ];
    const result = luDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.swaps).toBe(0);
    expect(result.permutation).toEqual([0, 1]);
    expectMatrixCloseTo(multiplyMatrices(result.lower, result.upper), permuteRows(A, result.permutation));
  });

  test('3x3 matrix는 P*A = L*U near equality를 만족한다', () => {
    const A = [
      [2, 1, 1],
      [4, 3, 3],
      [8, 7, 9],
    ];
    const result = luDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.permutation.length).toBe(3);
    expect([...result.permutation].sort((a, b) => a - b)).toEqual([0, 1, 2]);
    expectMatrixCloseTo(multiplyMatrices(result.lower, result.upper), permuteRows(A, result.permutation));
  });

  test('A[0][0] = 0인 system은 partial pivoting으로 swap을 일으킨다', () => {
    const A = [
      [0, 1],
      [1, 0],
    ];
    const result = luDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.swaps).toBe(1);
    expect(result.permutation).toEqual([1, 0]);
    // P*A = I이므로 L*U = I.
    expect(result.lower).toEqual([
      [1, 0],
      [0, 1],
    ]);
    expect(result.upper).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });

  test('1x1 matrix는 lower=[[1]], upper=[[v]], permutation=[0], swaps=0을 반환한다', () => {
    const result = luDecomposition([[5]]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.lower).toEqual([[1]]);
    expect(result.upper).toEqual([[5]]);
    expect(result.permutation).toEqual([0]);
    expect(result.swaps).toBe(0);
  });

  test('L은 lower triangular(diagonal 1, upper 영역 0)이고 U는 upper triangular(lower 영역 0)다', () => {
    const A = [
      [2, 1, 1],
      [4, 3, 3],
      [8, 7, 9],
    ];
    const result = luDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    const n = 3;
    for (let i = 0; i < n; i++) {
      expect(result.lower[i][i]).toBe(1);
      for (let j = i + 1; j < n; j++) {
        expect(result.lower[i][j]).toBe(0);
        expect(Object.is(result.lower[i][j], -0)).toBe(false);
      }
      for (let j = 0; j < i; j++) {
        expect(result.upper[i][j]).toBe(0);
        expect(Object.is(result.upper[i][j], -0)).toBe(false);
      }
    }
  });

  test('factor = 0 / negative pivot이 -0 sub-diagonal을 만들지 않는다', () => {
    // pivot이 음수이고 row[k] = 0이면 factor = 0 / -v = -0이 산출될 수 있다.
    // canonicalize 분기가 lower[1][0]에 +0을 기록하는지 확인.
    const result = luDecomposition([
      [-1, 0],
      [0, -1],
    ]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.lower[1][0]).toBe(0);
    expect(Object.is(result.lower[1][0], -0)).toBe(false);
  });

  test('upper 영역에 -0 input이 있어도 결과에 -0이 남지 않는다', () => {
    // input에 -0을 두면 elimination 결과로 upper에 -0이 들어갈 수 있다.
    // canonicalize 분기(v === 0 ? 0 : v)가 upper에도 적용되는지 확인.
    const result = luDecomposition([
      [-1, -0],
      [-0, -1],
    ]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.upper[0][1]).toBe(0);
    expect(Object.is(result.upper[0][1], -0)).toBe(false);
  });

  test('input matrix 참조를 공유하지 않는다', () => {
    const A = [
      [4, 3],
      [6, 3],
    ];
    const result = luDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    A[0][0] = 999;
    expect(result.upper[0][0]).not.toBe(999);
  });
});

describe('luDecomposition — empty', () => {
  test('빈 matrix는 비어있는 LUFactorization을 반환한다', () => {
    const result = luDecomposition([]);
    expect(result).toEqual({ lower: [], upper: [], permutation: [], swaps: 0 });
  });
});

describe('luDecomposition — singular', () => {
  test('singular matrix는 undefined를 반환한다', () => {
    // [[1, 2], [2, 4]]는 row 2가 row 1의 2배 → rank 1.
    const result = luDecomposition([
      [1, 2],
      [2, 4],
    ]);
    expect(result).toBeUndefined();
  });

  test('zero row가 섞인 singular 3x3은 undefined를 반환한다', () => {
    const result = luDecomposition([
      [1, 2, 3],
      [2, 4, 6],
      [0, 0, 0],
    ]);
    expect(result).toBeUndefined();
  });

  test('custom epsilon이 크면 작은 pivot도 singular로 판정한다', () => {
    // 모든 pivot abs가 1e-4 이하라면 epsilon = 1e-3에서 singular.
    const result = luDecomposition(
      [
        [1e-5, 0],
        [0, 1e-5],
      ],
      { epsilon: 1e-3 }
    );
    expect(result).toBeUndefined();
  });

  test('custom epsilon = 0이면 정확한 0 pivot만 singular로 본다', () => {
    // [[1e-15, 0], [0, 1]]는 default epsilon에서는 singular이지만 epsilon=0에서는 non-zero pivot으로 인식.
    const result = luDecomposition(
      [
        [1e-15, 0],
        [0, 1],
      ],
      { epsilon: 0 }
    );
    expect(result).toBeDefined();
  });
});

describe('luDecomposition — validation', () => {
  test('non-square (2x3)은 RangeError를 던진다', () => {
    expect(() =>
      luDecomposition([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toThrow(RangeError);
  });

  test('non-square (3x2)는 RangeError를 던진다', () => {
    expect(() =>
      luDecomposition([
        [1, 2],
        [3, 4],
        [5, 6],
      ])
    ).toThrow(RangeError);
  });

  test('ragged row는 RangeError를 던진다', () => {
    expect(() => luDecomposition([[1, 2], [3]])).toThrow(RangeError);
  });

  test('one-sided zero shape `[[]]`은 RangeError를 던진다', () => {
    expect(() => luDecomposition([[]])).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'non-finite entry %s는 RangeError를 던진다',
    (bad) => {
      expect(() =>
        luDecomposition([
          [1, 0],
          [bad, 1],
        ])
      ).toThrow(RangeError);
    }
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('invalid epsilon %s는 RangeError를 던진다', (bad) => {
    expect(() => luDecomposition([[1]], { epsilon: bad })).toThrow(RangeError);
  });

  test('invalid epsilon은 non-square 검증보다 먼저 throw한다', () => {
    expect(() =>
      luDecomposition(
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
        { epsilon: -1 }
      )
    ).toThrow(/epsilon/);
  });
});

describe('luDecomposition — overflow', () => {
  test('factor * row[j] 차감이 Infinity로 overflow되면 RangeError를 던진다', () => {
    // A=[[1, MAX], [1, -MAX]]. maxAbs at row 0(strict > 비교) → swap 없음. factor=1.
    // temp[1][1] = -MAX - 1 * MAX = -MAX - MAX = -Infinity → RangeError.
    expect(() =>
      luDecomposition([
        [1, Number.MAX_VALUE],
        [1, -Number.MAX_VALUE],
      ])
    ).toThrow(RangeError);
  });
});
