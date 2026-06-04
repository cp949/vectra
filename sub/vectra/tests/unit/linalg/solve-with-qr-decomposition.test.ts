/**
 * solveWithQrDecomposition unit test.
 *
 * 정상 입력:
 *   — qrDecomposition으로 만든 decomposition으로 square / tall full-column-rank system을 푼다.
 *   — 결과에 `-0`이 남지 않는다(Object.is로 검증).
 *   — input vector 참조를 공유하지 않는다.
 *
 * rank ambiguity:
 *   — rank === 0, b.length === 0은 [].
 *   — rank === 0이지만 b.length > 0이면 RangeError (shape ambiguity).
 *
 * rank-deficient → undefined:
 *   — square rank-deficient(rank < n) → undefined.
 *   — tall rank-deficient (m > n, rank < n) → undefined.
 *   — wide matrix(m < n, rank < n) → undefined.
 *
 * singular R → undefined:
 *   — R diagonal abs <= epsilon → undefined.
 *   — custom epsilon 이하 R diagonal은 singular로 본다.
 *
 * validation:
 *   — invalid rank(음수, NaN, 0.5, MAX_SAFE_INTEGER+1, Infinity) → RangeError.
 *   — orthogonal.length !== b.length, ragged orthogonal/upper, upper.length !== rank → RangeError.
 *   — Q^T*b 누적 overflow → RangeError.
 *   — invalid epsilon / non-finite entry → RangeError.
 *   — 검증 순서: epsilon → structural.
 */

import { describe, expect, test } from 'vitest';
import { qrDecomposition } from '../../../src/linalg/qr-decomposition';
import { solveWithQrDecomposition } from '../../../src/linalg/solve-with-qr-decomposition';
import type { QRDecomposition } from '../../../src/linalg/types';

/**
 * 두 vector가 element-wise로 가까운지 검증한다.
 *
 * 결과 solution `number[]`의 entry를 reference에 element-wise로 `toBeCloseTo`로 비교한다. shape는
 * caller가 보장한다.
 */
function expectVectorCloseTo(actual: readonly number[], expected: readonly number[], precision = 10): void {
  expect(actual.length).toBe(expected.length);
  for (let i = 0; i < expected.length; i++) {
    expect(actual[i]).toBeCloseTo(expected[i], precision);
  }
}

describe('solveWithQrDecomposition — 정상 입력', () => {
  test('1x1 nonsingular matrix의 QR로 A*x=b를 푼다', () => {
    // A = [[3]], b = [12]. x = [4].
    const dec = qrDecomposition([[3]]);
    const result = solveWithQrDecomposition(dec, [12]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectVectorCloseTo(result, [4]);
  });

  test('2x2 nonsingular matrix의 QR로 A*x=b를 푼다', () => {
    // A = [[1, 2], [3, 4]]. b = [5, 11]. det(A) = -2. x = A^-1 * b.
    // A^-1 = (1/-2) * [[4, -2], [-3, 1]] = [[-2, 1], [1.5, -0.5]].
    // x = [-2*5 + 1*11, 1.5*5 + (-0.5)*11] = [1, 2].
    const A = [
      [1, 2],
      [3, 4],
    ];
    const dec = qrDecomposition(A);
    const result = solveWithQrDecomposition(dec, [5, 11]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectVectorCloseTo(result, [1, 2]);
  });

  test('3x3 full-rank matrix의 QR로 A*x=b를 푼다', () => {
    // A = [[12, -51, 4], [6, 167, -68], [-4, 24, -41]]. b = A * [1, 1, 1] = [-35, 105, -21].
    const A = [
      [12, -51, 4],
      [6, 167, -68],
      [-4, 24, -41],
    ];
    const b = [-35, 105, -21];
    const dec = qrDecomposition(A);
    const result = solveWithQrDecomposition(dec, b);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectVectorCloseTo(result, [1, 1, 1], 8);
  });

  test('tall 3x2 full-column-rank QR로 least-squares solve를 수행한다', () => {
    // overdetermined consistent system. A = [[1, 0], [1, 1], [0, 1]]. x* = [1, 2].
    // b = A * x* = [1, 3, 2]. exact fit이라 residual = 0이고 R*x = Q^T*b가 정확한 해를 준다.
    const A = [
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    const b = [1, 3, 2];
    const dec = qrDecomposition(A);
    expect(dec.rank).toBe(2);
    const result = solveWithQrDecomposition(dec, b);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectVectorCloseTo(result, [1, 2]);
  });

  test('1x1 negative matrix [[-5]] x = [10]은 [-2]를 반환한다', () => {
    // sign convention으로 Q = [[1]], R = [[-5]]. Q^T*b = 10. R*x = 10 → x = -2.
    const dec = qrDecomposition([[-5]]);
    const result = solveWithQrDecomposition(dec, [10]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectVectorCloseTo(result, [-2]);
  });

  test('결과는 새 number[] 인스턴스라 input vector 참조를 공유하지 않는다', () => {
    const dec = qrDecomposition([
      [1, 2],
      [3, 4],
    ]);
    const b = [5, 11];
    const result = solveWithQrDecomposition(dec, b);
    expect(result).toBeDefined();
    if (result === undefined) return;
    b[0] = 999;
    expectVectorCloseTo(result, [1, 2]);
  });

  test('결과에 -0이 남지 않는다', () => {
    // identity QR. Q = I_2, R = I_2. b = [0, 0] → x = [0, 0].
    const dec: QRDecomposition = {
      orthogonal: [
        [1, 0],
        [0, 1],
      ],
      upper: [
        [1, 0],
        [0, 1],
      ],
      rank: 2,
    };
    const result = solveWithQrDecomposition(dec, [0, 0]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(Object.is(result[0], -0)).toBe(false);
    expect(Object.is(result[1], -0)).toBe(false);
    expect(Object.is(result[0], 0)).toBe(true);
    expect(Object.is(result[1], 0)).toBe(true);
  });
});

describe('solveWithQrDecomposition — rank ambiguity', () => {
  test('rank === 0, b.length === 0은 [] 반환', () => {
    const dec: QRDecomposition = { orthogonal: [], upper: [], rank: 0 };
    expect(solveWithQrDecomposition(dec, [])).toEqual([]);
  });

  test('rank === 0이지만 b.length > 0이면 RangeError (shape ambiguity)', () => {
    const dec: QRDecomposition = { orthogonal: [], upper: [], rank: 0 };
    expect(() => solveWithQrDecomposition(dec, [1])).toThrow(RangeError);
  });

  test('all-zero matrix(rank === 0) decomposition은 b가 비지 않으면 RangeError', () => {
    // qrDecomposition은 zero matrix에서 rank === 0인 decomposition을 만든다. 본 helper는
    // shape ambiguity로 인해 b.length > 0이면 RangeError.
    const dec = qrDecomposition([
      [0, 0],
      [0, 0],
    ]);
    expect(dec.rank).toBe(0);
    expect(() => solveWithQrDecomposition(dec, [1, 2])).toThrow(RangeError);
  });
});

describe('solveWithQrDecomposition — rank-deficient는 undefined', () => {
  test('square rank-deficient(rank < n)은 undefined', () => {
    // A = [[1, 2], [2, 4]]. rank = 1, n = 2.
    const A = [
      [1, 2],
      [2, 4],
    ];
    const dec = qrDecomposition(A);
    expect(dec.rank).toBe(1);
    expect(solveWithQrDecomposition(dec, [3, 6])).toBeUndefined();
  });

  test('tall rank-deficient (m > n, rank < n)은 undefined', () => {
    // A = [[1, 2], [2, 4], [3, 6]]. rank = 1, n = 2.
    const A = [
      [1, 2],
      [2, 4],
      [3, 6],
    ];
    const dec = qrDecomposition(A);
    expect(dec.rank).toBe(1);
    expect(solveWithQrDecomposition(dec, [1, 2, 3])).toBeUndefined();
  });

  test('wide matrix(m < n)은 rank가 n에 미치지 못해 undefined', () => {
    // A = [[1, 0, 1], [0, 1, 1]]. m=2, n=3, rank=2 < n=3.
    const A = [
      [1, 0, 1],
      [0, 1, 1],
    ];
    const dec = qrDecomposition(A);
    expect(dec.rank).toBe(2);
    expect(solveWithQrDecomposition(dec, [1, 1])).toBeUndefined();
  });
});

describe('solveWithQrDecomposition — singular R', () => {
  test('R diagonal abs가 epsilon 이하이면 undefined', () => {
    // rank === n인 정상 shape이지만 R diagonal에 zero가 끼인 비정상 case.
    const dec: QRDecomposition = {
      orthogonal: [
        [1, 0],
        [0, 1],
      ],
      upper: [
        [2, 3],
        [0, 0],
      ],
      rank: 2,
    };
    expect(solveWithQrDecomposition(dec, [4, 5])).toBeUndefined();
  });

  test('custom epsilon 이하 R diagonal은 singular로 본다', () => {
    const dec: QRDecomposition = {
      orthogonal: [
        [1, 0],
        [0, 1],
      ],
      upper: [
        [2, 0],
        [0, 1e-6],
      ],
      rank: 2,
    };
    expect(solveWithQrDecomposition(dec, [1, 1], { epsilon: 1e-3 })).toBeUndefined();
  });
});

describe('solveWithQrDecomposition — validation', () => {
  test.each([
    -1,
    Number.NaN,
    0.5,
    Number.MAX_SAFE_INTEGER + 1,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('invalid rank %s는 RangeError를 던진다', (bad) => {
    const dec = { orthogonal: [], upper: [], rank: bad } as unknown as QRDecomposition;
    expect(() => solveWithQrDecomposition(dec, [])).toThrow(RangeError);
  });

  test('orthogonal이 array가 아니면 RangeError', () => {
    const dec = {
      orthogonal: 'not-array' as unknown as number[][],
      upper: [],
      rank: 0,
    } as unknown as QRDecomposition;
    expect(() => solveWithQrDecomposition(dec, [])).toThrow(RangeError);
  });

  test('upper가 array가 아니면 RangeError', () => {
    const dec = {
      orthogonal: [],
      upper: 'not-array' as unknown as number[][],
      rank: 0,
    } as unknown as QRDecomposition;
    expect(() => solveWithQrDecomposition(dec, [])).toThrow(RangeError);
  });

  test('rank === 0인데 orthogonal이 비어있지 않으면 RangeError', () => {
    const dec: QRDecomposition = { orthogonal: [[]] as unknown as number[][], upper: [], rank: 0 };
    expect(() => solveWithQrDecomposition(dec, [])).toThrow(RangeError);
  });

  test('rank === 0인데 upper가 비어있지 않으면 RangeError', () => {
    const dec: QRDecomposition = { orthogonal: [], upper: [[]] as unknown as number[][], rank: 0 };
    expect(() => solveWithQrDecomposition(dec, [])).toThrow(RangeError);
  });

  test('upper.length !== rank이면 RangeError', () => {
    const dec: QRDecomposition = {
      orthogonal: [
        [1, 0],
        [0, 1],
      ],
      upper: [[1, 2]],
      rank: 2,
    };
    expect(() => solveWithQrDecomposition(dec, [1, 2])).toThrow(RangeError);
  });

  test('upper가 ragged면 RangeError', () => {
    const dec = {
      orthogonal: [
        [1, 0],
        [0, 1],
      ],
      upper: [[1, 2], [3]],
      rank: 2,
    } as unknown as QRDecomposition;
    expect(() => solveWithQrDecomposition(dec, [1, 2])).toThrow(RangeError);
  });

  test('orthogonal.length !== b.length이면 RangeError', () => {
    // rank=2이고 upper는 2x2 valid. orthogonal은 3x2지만 b는 length 2.
    const dec: QRDecomposition = {
      orthogonal: [
        [1, 0],
        [0, 1],
        [0, 0],
      ],
      upper: [
        [1, 0],
        [0, 1],
      ],
      rank: 2,
    };
    expect(() => solveWithQrDecomposition(dec, [1, 2])).toThrow(RangeError);
  });

  test('orthogonal row 길이가 rank와 다르면 RangeError', () => {
    const dec = {
      orthogonal: [
        [1, 0, 0],
        [0, 1, 0],
      ],
      upper: [
        [1, 0],
        [0, 1],
      ],
      rank: 2,
    } as unknown as QRDecomposition;
    expect(() => solveWithQrDecomposition(dec, [1, 2])).toThrow(RangeError);
  });

  test('orthogonal이 ragged면 RangeError', () => {
    const dec = {
      orthogonal: [[1, 0], [0]],
      upper: [
        [1, 0],
        [0, 1],
      ],
      rank: 2,
    } as unknown as QRDecomposition;
    expect(() => solveWithQrDecomposition(dec, [1, 2])).toThrow(RangeError);
  });

  test('rank > 0이지만 orthogonal이 비어있으면 RangeError', () => {
    const dec: QRDecomposition = {
      orthogonal: [],
      upper: [
        [1, 0],
        [0, 1],
      ],
      rank: 2,
    };
    expect(() => solveWithQrDecomposition(dec, [])).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('orthogonal entry %s는 RangeError', (bad) => {
    const dec: QRDecomposition = {
      orthogonal: [
        [1, 0],
        [bad, 1],
      ],
      upper: [
        [1, 0],
        [0, 1],
      ],
      rank: 2,
    };
    expect(() => solveWithQrDecomposition(dec, [1, 2])).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('upper entry %s는 RangeError', (bad) => {
    const dec: QRDecomposition = {
      orthogonal: [
        [1, 0],
        [0, 1],
      ],
      upper: [
        [1, bad],
        [0, 1],
      ],
      rank: 2,
    };
    expect(() => solveWithQrDecomposition(dec, [1, 2])).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('b entry %s는 RangeError', (bad) => {
    const dec: QRDecomposition = {
      orthogonal: [
        [1, 0],
        [0, 1],
      ],
      upper: [
        [1, 0],
        [0, 1],
      ],
      rank: 2,
    };
    expect(() => solveWithQrDecomposition(dec, [bad, 1])).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('invalid epsilon %s는 RangeError', (bad) => {
    const dec: QRDecomposition = { orthogonal: [[1]], upper: [[1]], rank: 1 };
    expect(() => solveWithQrDecomposition(dec, [1], { epsilon: bad })).toThrow(RangeError);
  });

  test('invalid epsilon은 structural 검증 전에 던진다', () => {
    // upper가 ragged이지만 epsilon 검증이 먼저 일어나야 한다.
    const dec = {
      orthogonal: [
        [1, 0],
        [0, 1],
      ],
      upper: [[1, 0], [0]],
      rank: 2,
    } as unknown as QRDecomposition;
    expect(() => solveWithQrDecomposition(dec, [1, 2], { epsilon: -1 })).toThrow(/epsilon/);
  });

  test('Q^T * b 누적 overflow는 RangeError', () => {
    // orthogonal[i][0]은 모두 MAX_VALUE, b도 모두 MAX_VALUE라 term = MAX*MAX = Infinity.
    const huge = Number.MAX_VALUE;
    const dec: QRDecomposition = {
      orthogonal: [[huge], [huge]],
      upper: [[1]],
      rank: 1,
    };
    expect(() => solveWithQrDecomposition(dec, [huge, huge])).toThrow(RangeError);
  });

  test('Q^T * b 누적 sum overflow도 RangeError', () => {
    // 각 term이 finite이지만 누적 합이 Infinity로 전이되는 경우.
    const huge = Number.MAX_VALUE;
    const dec: QRDecomposition = {
      orthogonal: [[1], [1]],
      upper: [[1]],
      rank: 1,
    };
    expect(() => solveWithQrDecomposition(dec, [huge, huge])).toThrow(RangeError);
  });

  test('R backward substitution division overflow는 RangeError', () => {
    // diagonal이 epsilon보다 크지만 작아 division 결과가 Infinity.
    const huge = Number.MAX_VALUE;
    const dec: QRDecomposition = {
      orthogonal: [[1]],
      upper: [[0.5]],
      rank: 1,
    };
    expect(() => solveWithQrDecomposition(dec, [huge])).toThrow(RangeError);
  });
});
