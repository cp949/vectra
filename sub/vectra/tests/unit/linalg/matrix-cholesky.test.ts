/**
 * linalg Cholesky decomposition unit test.
 *
 * choleskyDecomposition
 *   — 1x1 / 2x2 / 3x3 SPD matrix lower triangular factorization, L*L^T near A.
 *   — empty matrix `[]` → `{ lower: [] }`.
 *   — non-symmetric matrix → RangeError.
 *   — symmetric but not positive-definite matrix → undefined.
 *   — custom epsilon으로 near-zero pivot 실패 고정.
 *   — validation: non-square, ragged, one-sided `[[]]`, non-finite entry(off/diagonal 위치),
 *     invalid epsilon, epsilon 우선.
 *   — overflow/intermediate non-finite → RangeError.
 *   — lower upper 영역 정확히 0, diagonal 양수, off-diagonal `-0` 미보존, input 참조 비공유.
 */

import { describe, expect, test } from 'vitest';
import { choleskyDecomposition } from '../../../src/linalg/cholesky-decomposition';
import { multiplyMatrices } from '../../../src/linalg/multiply-matrices';
import { transpose } from '../../../src/linalg/transpose';

/**
 * 두 matrix가 element-wise로 가까운지 검증한다.
 *
 * shape는 동일하다고 가정한다. `toBeCloseTo`의 precision 인자로 digit 단위 허용 오차를 지정한다.
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

describe('choleskyDecomposition — 정상 입력', () => {
  test('1x1 SPD matrix [[4]]는 lower=[[2]]를 반환한다', () => {
    const result = choleskyDecomposition([[4]]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.lower).toEqual([[2]]);
  });

  test('2x2 SPD matrix는 L*L^T = A 근사를 만족한다', () => {
    // A = [[4, 12], [12, 37]]. L = [[2, 0], [6, 1]].
    const A = [
      [4, 12],
      [12, 37],
    ];
    const result = choleskyDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.lower[0][0]).toBeCloseTo(2, 12);
    expect(result.lower[1][0]).toBeCloseTo(6, 12);
    expect(result.lower[1][1]).toBeCloseTo(1, 12);
    expect(result.lower[0][1]).toBe(0);
    expectMatrixCloseTo(multiplyMatrices(result.lower, transpose(result.lower)), A);
  });

  test('3x3 SPD matrix는 L*L^T = A 근사를 만족한다', () => {
    // 알려진 케이스: [[25, 15, -5], [15, 18, 0], [-5, 0, 11]] → L = [[5,0,0],[3,3,0],[-1,1,3]].
    const A = [
      [25, 15, -5],
      [15, 18, 0],
      [-5, 0, 11],
    ];
    const result = choleskyDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.lower[0][0]).toBeCloseTo(5, 12);
    expect(result.lower[1][0]).toBeCloseTo(3, 12);
    expect(result.lower[1][1]).toBeCloseTo(3, 12);
    expect(result.lower[2][0]).toBeCloseTo(-1, 12);
    expect(result.lower[2][1]).toBeCloseTo(1, 12);
    expect(result.lower[2][2]).toBeCloseTo(3, 12);
    expectMatrixCloseTo(multiplyMatrices(result.lower, transpose(result.lower)), A);
  });

  test('off-diagonal 계산에서 발생한 -0은 +0으로 canonicalize한다', () => {
    // L[1][0] = (a[1][0] - sum) / L[0][0]. a[1][0] = -0, sum = 0이면 -0 / 1 = -0이 산출된다.
    // canonicalize 분기(`Object.is(value, -0) ? 0 : value`)가 trigger되는지 확인.
    const result = choleskyDecomposition([
      [1, -0],
      [-0, 1],
    ]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.lower[1][0]).toBe(0);
    expect(Object.is(result.lower[1][0], -0)).toBe(false);
  });

  test('lower upper 영역은 정확히 0이고 diagonal은 양수이며 -0이 남지 않는다', () => {
    const A = [
      [4, -2, 2],
      [-2, 2, -4],
      [2, -4, 11],
    ];
    const result = choleskyDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    const n = 3;
    for (let i = 0; i < n; i++) {
      expect(result.lower[i][i]).toBeGreaterThan(0);
      for (let j = i + 1; j < n; j++) {
        expect(result.lower[i][j]).toBe(0);
        expect(Object.is(result.lower[i][j], -0)).toBe(false);
      }
    }
    // L*L^T가 A에 가깝다.
    expectMatrixCloseTo(multiplyMatrices(result.lower, transpose(result.lower)), A);
  });

  test('identity matrix는 자기 자신을 lower로 반환한다', () => {
    const result = choleskyDecomposition([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.lower).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  test('input matrix 참조를 공유하지 않는다', () => {
    const A: number[][] = [
      [4, 2],
      [2, 5],
    ];
    const result = choleskyDecomposition(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    A[0][0] = 999;
    expect(result.lower[0][0]).not.toBe(999);
  });
});

describe('choleskyDecomposition — empty', () => {
  test('빈 matrix는 비어있는 lower를 반환한다', () => {
    const result = choleskyDecomposition([]);
    expect(result).toEqual({ lower: [] });
  });
});

describe('choleskyDecomposition — positive-definite 실패', () => {
  test('symmetric but not positive-definite matrix는 undefined를 반환한다', () => {
    // [[1, 2], [2, 1]]은 symmetric이지만 eigenvalue 음수(determinant -3).
    expect(
      choleskyDecomposition([
        [1, 2],
        [2, 1],
      ])
    ).toBeUndefined();
  });

  test('zero diagonal symmetric matrix는 undefined를 반환한다', () => {
    expect(
      choleskyDecomposition([
        [0, 0],
        [0, 0],
      ])
    ).toBeUndefined();
  });

  test('1x1 zero pivot [[0]]은 undefined를 반환한다', () => {
    expect(choleskyDecomposition([[0]])).toBeUndefined();
  });

  test('negative diagonal symmetric matrix는 undefined를 반환한다', () => {
    expect(choleskyDecomposition([[-1]])).toBeUndefined();
  });

  test('custom epsilon이 크면 near-zero pivot도 실패한다', () => {
    // diagonal 1e-12는 default epsilon 1e-9보다 작아 positive-definite 실패.
    expect(choleskyDecomposition([[1e-12]])).toBeUndefined();
  });

  test('custom epsilon = 0이면 작은 finite pivot도 통과한다', () => {
    const result = choleskyDecomposition([[1e-12]], { epsilon: 0 });
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.lower[0][0]).toBeCloseTo(1e-6, 18);
  });

  test('singly-not-pd 3x3는 undefined를 반환한다', () => {
    // diagonal 2-pd 위반이 단일 row에 있어도 검출돼야 한다.
    expect(
      choleskyDecomposition([
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ])
    ).toBeUndefined();
  });
});

describe('choleskyDecomposition — validation', () => {
  test('non-square (2x3)은 RangeError를 던진다', () => {
    expect(() =>
      choleskyDecomposition([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toThrow(RangeError);
  });

  test('non-square (3x2)는 RangeError를 던진다', () => {
    expect(() =>
      choleskyDecomposition([
        [1, 2],
        [3, 4],
        [5, 6],
      ])
    ).toThrow(RangeError);
  });

  test('ragged row는 RangeError를 던진다', () => {
    expect(() => choleskyDecomposition([[1, 2], [3]])).toThrow(RangeError);
  });

  test('one-sided zero shape `[[]]`은 RangeError를 던진다', () => {
    expect(() => choleskyDecomposition([[]])).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('non-finite entry %s는 RangeError를 던진다', (bad) => {
    expect(() =>
      choleskyDecomposition([
        [1, 0],
        [0, bad],
      ])
    ).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('1x1 diagonal 위치의 non-finite entry %s도 RangeError를 던진다', (bad) => {
    expect(() => choleskyDecomposition([[bad]])).toThrow(RangeError);
  });

  test('non-symmetric matrix는 RangeError를 던진다', () => {
    expect(() =>
      choleskyDecomposition([
        [4, 2],
        [3, 5],
      ])
    ).toThrow(RangeError);
  });

  test('symmetry 위반이 epsilon보다 크면 RangeError를 던진다', () => {
    // |2 - 2.01| = 0.01 > 1e-9.
    expect(() =>
      choleskyDecomposition([
        [4, 2],
        [2.01, 5],
      ])
    ).toThrow(RangeError);
  });

  test('symmetry 차이가 epsilon 이하이면 통과한다', () => {
    // |2 - (2 + 1e-12)| = 1e-12 <= default 1e-9.
    const result = choleskyDecomposition([
      [4, 2],
      [2 + 1e-12, 5],
    ]);
    expect(result).toBeDefined();
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('invalid epsilon %s는 RangeError를 던진다', (bad) => {
    expect(() => choleskyDecomposition([[1]], { epsilon: bad })).toThrow(RangeError);
  });

  test('invalid epsilon은 non-square 검증보다 먼저 throw한다', () => {
    expect(() =>
      choleskyDecomposition(
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
        { epsilon: -1 }
      )
    ).toThrow(/epsilon/);
  });
});

describe('choleskyDecomposition — overflow', () => {
  test('diagonal 계산 중 누적 합이 Infinity로 overflow되면 RangeError를 던진다', () => {
    // L[1][0] = v finite. 그러나 L[1][1] = sqrt(a[1][1] - L[1][0]^2)에서 L[1][0]^2 = v*v = Infinity.
    // a[1][1] - Infinity = -Infinity → finite 검사가 잡아 RangeError.
    const v = Math.sqrt(Number.MAX_VALUE) * 10;
    expect(() =>
      choleskyDecomposition([
        [1, v],
        [v, 1],
      ])
    ).toThrow(RangeError);
  });

  test('3x3에서도 누적 합이 Infinity로 overflow되면 RangeError를 던진다', () => {
    // row-by-row 알고리즘이라 `i=1, j=1` diagonal branch에서 먼저 sum non-finite를 잡는다.
    // 3x3로 확장해도 같은 분기가 우선 trigger되며, 이는 의도된 fast-fail이다. off-diagonal
    // (`i > j` and `j >= 2`) sum overflow는 모든 직전 `lower[i][k]`/`lower[j][k]`가 finite check를
    // 통과해야 도달하는데, 그 조건을 만들어내려면 직전 diagonal 계산에서 이미 Infinity sum이
    // 발생해 throw되므로 reachable 여부가 불분명하다(후속 dead-branch 검토 항목).
    const v = Math.sqrt(Number.MAX_VALUE) * 10;
    expect(() =>
      choleskyDecomposition([
        [1, v, v],
        [v, 1, 1],
        [v, 1, 1],
      ])
    ).toThrow(RangeError);
  });
});
