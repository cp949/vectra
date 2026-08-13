/**
 * linalg QR decomposition unit test.
 *
 * qrDecomposition
 *   — square / tall / wide full-rank thin QR. Q*R near A, Q^T*Q near I_r.
 *   — rank-deficient column, zero column. rank-deficient QR로 반환(undefined 아님).
 *   — sign convention: 각 step의 strict-zero가 아닌 첫 entry가 양수가 되도록 column sign 고정.
 *   — empty matrix `[]` → `{ orthogonal: [], upper: [], rank: 0 }`.
 *   — ragged, one-sided `[[]]`, non-finite entry, invalid epsilon, epsilon 우선.
 *   — overflow/intermediate non-finite → RangeError.
 *   — 결과에 `-0` 미보존, input 참조 비공유.
 *   — m x rank / rank x n shape: 모든 row 길이 검증.
 */

import { describe, expect, test } from 'vitest';
import { multiplyMatrices } from '../../../src/linalg/multiply-matrices';
import { qrDecomposition } from '../../../src/linalg/qr-decomposition';
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

/**
 * r x r identity matrix를 만든다.
 */
function identity(r: number): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < r; i++) {
    const row: number[] = [];
    for (let j = 0; j < r; j++) row.push(i === j ? 1 : 0);
    out.push(row);
  }
  return out;
}

/**
 * `orthogonal`이 `m x rank` shape이고 `upper`가 `rank x n` shape인지 검증한다.
 *
 * 모든 row의 length가 일관되는지(ragged-free) 함께 확인한다.
 */
function expectQrShape(
  result: { readonly orthogonal: number[][]; readonly upper: number[][]; readonly rank: number },
  m: number,
  n: number,
  rank: number
): void {
  expect(result.rank).toBe(rank);
  if (rank === 0) {
    expect(result.orthogonal).toEqual([]);
    expect(result.upper).toEqual([]);
    return;
  }
  expect(result.orthogonal.length).toBe(m);
  for (const row of result.orthogonal) {
    expect(row.length).toBe(rank);
  }
  expect(result.upper.length).toBe(rank);
  for (const row of result.upper) {
    expect(row.length).toBe(n);
  }
}

describe('qrDecomposition — 정상 입력 full-rank', () => {
  test('2x2 full-rank matrix는 Q*R = A, Q^T*Q = I_2를 만족한다', () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    const result = qrDecomposition(A);
    expectQrShape(result, 2, 2, 2);
    expectMatrixCloseTo(multiplyMatrices(result.orthogonal, result.upper), A);
    expectMatrixCloseTo(multiplyMatrices(transpose(result.orthogonal), result.orthogonal), identity(2));
  });

  test('3x3 full-rank matrix는 Q*R = A, Q^T*Q = I_3를 만족한다', () => {
    const A = [
      [12, -51, 4],
      [6, 167, -68],
      [-4, 24, -41],
    ];
    const result = qrDecomposition(A);
    expectQrShape(result, 3, 3, 3);
    expectMatrixCloseTo(multiplyMatrices(result.orthogonal, result.upper), A, 8);
    expectMatrixCloseTo(multiplyMatrices(transpose(result.orthogonal), result.orthogonal), identity(3), 10);
  });

  test('tall 3x2 full-rank matrix는 m x r / r x n shape를 가지며 Q*R = A를 만족한다', () => {
    const A = [
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    const result = qrDecomposition(A);
    expectQrShape(result, 3, 2, 2);
    expectMatrixCloseTo(multiplyMatrices(result.orthogonal, result.upper), A);
    expectMatrixCloseTo(multiplyMatrices(transpose(result.orthogonal), result.orthogonal), identity(2));
  });

  test('wide 2x3 full-rank matrix는 m x r / r x n shape를 가지며 Q*R = A를 만족한다', () => {
    const A = [
      [1, 0, 1],
      [0, 1, 1],
    ];
    const result = qrDecomposition(A);
    expectQrShape(result, 2, 3, 2);
    expectMatrixCloseTo(multiplyMatrices(result.orthogonal, result.upper), A);
    expectMatrixCloseTo(multiplyMatrices(transpose(result.orthogonal), result.orthogonal), identity(2));
  });

  test('1x1 matrix [[5]]는 rank 1 QR을 반환한다', () => {
    const result = qrDecomposition([[5]]);
    expectQrShape(result, 1, 1, 1);
    expect(result.orthogonal).toEqual([[1]]);
    expect(result.upper).toEqual([[5]]);
  });

  test('1x1 negative matrix [[-5]]는 sign convention으로 Q를 [[1]]로 고정한다', () => {
    // v = [-5]. norm = 5. strict-zero가 아닌 첫 entry는 -5 (음수). sign = -1.
    // Q = (-1) * v / norm = [1]. R[0][0] = -1 * 5 = -5. A = Q * R = [-5]. ✓
    const result = qrDecomposition([[-5]]);
    expectQrShape(result, 1, 1, 1);
    expect(result.orthogonal).toEqual([[1]]);
    expect(result.upper).toEqual([[-5]]);
  });

  test('sign convention: Q column의 strict-zero가 아닌 첫 entry가 양수다', () => {
    // A = [[-3, 0], [0, 4]].
    // column 0 v=[-3,0] norm=3 첫 non-zero = -3, sign=-1 → Q[0]=[1,0] R[0][0]=-3.
    // column 1 v=[0,4] proj on Q[0]=0, R[0][1]=0. v=[0,4] norm=4 첫 non-zero=4 sign=+1 → Q[1]=[0,1] R[1][1]=4.
    const result = qrDecomposition([
      [-3, 0],
      [0, 4],
    ]);
    expectQrShape(result, 2, 2, 2);
    // Q column 0의 strict-zero가 아닌 첫 entry는 orthogonal[0][0] = 1 > 0.
    expect(result.orthogonal[0][0]).toBeCloseTo(1, 12);
    // Q column 1의 strict-zero가 아닌 첫 entry는 orthogonal[1][1] = 1 > 0.
    expect(result.orthogonal[1][1]).toBeCloseTo(1, 12);
    expect(result.upper[0][0]).toBeCloseTo(-3, 12);
    expect(result.upper[1][1]).toBeCloseTo(4, 12);
  });
});

describe('qrDecomposition — empty', () => {
  test('빈 matrix는 비어있는 QR을 반환한다', () => {
    expect(qrDecomposition([])).toEqual({ orthogonal: [], upper: [], rank: 0 });
  });
});

describe('qrDecomposition — rank-deficient', () => {
  test('rank-deficient 2x2는 dependent column을 R에 coefficient로만 남긴다', () => {
    // A = [[1, 2], [2, 4]]. column 0 v=[1,2] norm=sqrt(5). Q[0]=v/sqrt(5).
    // column 1 v=[2,4]. proj on Q[0]: dot = 10/sqrt(5) = 2*sqrt(5).
    // R[0][1] = 2*sqrt(5). v -= 2*sqrt(5)*Q[0] = [0,0]. dependent. rank=1.
    const A = [
      [1, 2],
      [2, 4],
    ];
    const result = qrDecomposition(A);
    expectQrShape(result, 2, 2, 1);
    expect(result.upper[0][0]).toBeCloseTo(Math.sqrt(5), 12);
    expect(result.upper[0][1]).toBeCloseTo(2 * Math.sqrt(5), 12);
    expectMatrixCloseTo(multiplyMatrices(result.orthogonal, result.upper), A);
  });

  test('first column이 zero column이면 rank가 줄어든다', () => {
    // A = [[0, 1], [0, 2]]. column 0 dependent(norm=0). column 1 v=[1,2] sign=+1 → Q[0]=v/sqrt(5).
    const A = [
      [0, 1],
      [0, 2],
    ];
    const result = qrDecomposition(A);
    expectQrShape(result, 2, 2, 1);
    // column 0(dependent)의 R coefficient은 0이고 column 1의 R diagonal은 sqrt(5).
    expect(result.upper[0][0]).toBe(0);
    expect(result.upper[0][1]).toBeCloseTo(Math.sqrt(5), 12);
    expectMatrixCloseTo(multiplyMatrices(result.orthogonal, result.upper), A);
  });

  test('middle column이 zero column이면 rank는 줄지만 surrounding column은 독립이다', () => {
    // A = [[1, 0, 0], [0, 0, 1]]. col 0 v=[1,0] norm=1 sign=+1 → Q[0]=[1,0] R[0][0]=1.
    // col 1 v=[0,0] proj on Q[0]=0 → R[0][1]=0. norm=0 → dependent.
    // col 2 v=[0,1] proj on Q[0]=0 → R[0][2]=0. norm=1 sign=+1 → Q[1]=[0,1] R[1][2]=1.
    const A = [
      [1, 0, 0],
      [0, 0, 1],
    ];
    const result = qrDecomposition(A);
    expectQrShape(result, 2, 3, 2);
    expect(result.upper[0][0]).toBeCloseTo(1, 12);
    expect(result.upper[0][1]).toBe(0);
    expect(result.upper[0][2]).toBe(0);
    expect(result.upper[1][2]).toBeCloseTo(1, 12);
    expectMatrixCloseTo(multiplyMatrices(result.orthogonal, result.upper), A);
  });

  test('last column이 zero column이면 rank는 줄어들고 R 마지막 column은 0이다', () => {
    // A = [[1, 0], [0, 0]]. col 0 v=[1,0] → Q[0]=[1,0] R[0][0]=1.
    // col 1 v=[0,0] proj on Q[0]=0 → R[0][1]=0. norm=0 → dependent.
    const A = [
      [1, 0],
      [0, 0],
    ];
    const result = qrDecomposition(A);
    expectQrShape(result, 2, 2, 1);
    expect(result.upper[0][0]).toBeCloseTo(1, 12);
    expect(result.upper[0][1]).toBe(0);
    expectMatrixCloseTo(multiplyMatrices(result.orthogonal, result.upper), A);
  });

  test('all-zero matrix는 rank 0 QR을 반환한다', () => {
    const result = qrDecomposition([
      [0, 0, 0],
      [0, 0, 0],
    ]);
    expectQrShape(result, 2, 3, 0);
  });

  test('rank-deficient 3x3에서 Q^T * Q = I_r를 만족한다', () => {
    // [1,0,1]; [0,1,1]; [0,0,0]. col 2 = col 0 + col 1 → dependent.
    const A = [
      [1, 0, 1],
      [0, 1, 1],
      [0, 0, 0],
    ];
    const result = qrDecomposition(A);
    expectQrShape(result, 3, 3, 2);
    expectMatrixCloseTo(multiplyMatrices(result.orthogonal, result.upper), A);
    expectMatrixCloseTo(multiplyMatrices(transpose(result.orthogonal), result.orthogonal), identity(2));
  });
});

describe('qrDecomposition — validation', () => {
  test('ragged row는 RangeError를 던진다', () => {
    expect(() => qrDecomposition([[1, 2], [3]])).toThrow(RangeError);
  });

  test('one-sided zero shape `[[]]`은 RangeError를 던진다', () => {
    expect(() => qrDecomposition([[]])).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'non-finite entry %s는 RangeError를 던진다',
    (bad) => {
      expect(() =>
        qrDecomposition([
          [1, bad],
          [0, 1],
        ])
      ).toThrow(RangeError);
    }
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('invalid epsilon %s는 RangeError를 던진다', (bad) => {
    expect(() => qrDecomposition([[1]], { epsilon: bad })).toThrow(RangeError);
  });

  test('invalid epsilon은 non-finite 검증보다 먼저 throw한다', () => {
    expect(() =>
      qrDecomposition(
        [
          [Number.NaN, 0],
          [0, 1],
        ],
        { epsilon: -1 }
      )
    ).toThrow(/epsilon/);
  });

  test('custom epsilon이 크면 작은 norm column도 dependent로 본다', () => {
    // column 0: [1e-12, 0] norm = 1e-12. epsilon = 1e-9 → dependent.
    // column 1: [1, 0] norm = 1 > epsilon → independent. Q[0]=[1,0]. R[0][1]=1.
    // dependent column 0의 R coefficient = 0 (Q empty, 곱셈 결과 없음).
    const result = qrDecomposition(
      [
        [1e-12, 1],
        [0, 0],
      ],
      { epsilon: 1e-9 }
    );
    expectQrShape(result, 2, 2, 1);
    expect(result.upper[0][0]).toBe(0);
    expect(result.upper[0][1]).toBeCloseTo(1, 12);
  });
});

describe('qrDecomposition — overflow', () => {
  test('column norm이 Infinity로 overflow되면 RangeError를 던진다', () => {
    // [MAX, MAX, MAX, MAX] column. max-scaling으로도 norm = sqrt(4)*MAX = 2*MAX = Infinity.
    expect(() =>
      qrDecomposition([
        [Number.MAX_VALUE, 0],
        [Number.MAX_VALUE, 0],
        [Number.MAX_VALUE, 0],
        [Number.MAX_VALUE, 0],
      ])
    ).toThrow(RangeError);
  });
});

describe('qrDecomposition — 결과 형식', () => {
  test('-0 미보존: input에 -0이 있어도 결과에 -0이 남지 않는다', () => {
    const result = qrDecomposition([
      [-0, 1],
      [1, -0],
    ]);
    for (const row of result.orthogonal) {
      for (const v of row) {
        expect(Object.is(v, -0)).toBe(false);
      }
    }
    for (const row of result.upper) {
      for (const v of row) {
        expect(Object.is(v, -0)).toBe(false);
      }
    }
  });

  test('input matrix 참조를 공유하지 않는다', () => {
    const A: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const result = qrDecomposition(A);
    A[0][0] = 999;
    expect(result.upper[0][0]).not.toBe(999);
  });
});
