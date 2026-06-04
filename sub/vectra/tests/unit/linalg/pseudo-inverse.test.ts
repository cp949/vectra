import { describe, expect, test } from 'vitest';
import { multiplyMatrices } from '../../../src/linalg/multiply-matrices';
import { pseudoInverse } from '../../../src/linalg/pseudo-inverse';
import { pseudoInverseInto } from '../../../src/linalg/pseudo-inverse-into';
import { transpose } from '../../../src/linalg/transpose';

/**
 * 두 matrix가 element-wise로 가까운지 검증한다. shape도 함께 확인한다.
 */
function expectMatrixCloseTo(
  actual: readonly (readonly number[])[],
  expected: readonly (readonly number[])[],
  precision = 8
): void {
  expect(actual.length).toBe(expected.length);
  for (let r = 0; r < expected.length; r++) {
    expect(actual[r].length).toBe(expected[r].length);
    for (let c = 0; c < expected[r].length; c++) {
      expect(actual[r][c]).toBeCloseTo(expected[r][c], precision);
    }
  }
}

/** seed `out` matrix를 `rows x columns` 크기로 0으로 채워 만든다. */
function makeOut(rows: number, columns: number): number[][] {
  const out: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    const row = new Array<number>(columns);
    for (let c = 0; c < columns; c++) row[c] = 0;
    out[r] = row;
  }
  return out;
}

describe('pseudoInverseInto / pseudoInverse — square invertible', () => {
  test('2x2 invertible matrix의 pseudo-inverse는 inverse와 동일하다', () => {
    const A = [
      [4, 7],
      [2, 6],
    ];
    // inverse = (1/10) * [[6, -7], [-2, 4]]
    const expected = [
      [0.6, -0.7],
      [-0.2, 0.4],
    ];
    const result = pseudoInverse(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectMatrixCloseTo(result, expected);
  });

  test('identity matrix의 pseudo-inverse는 identity다', () => {
    const A = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
    const result = pseudoInverse(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectMatrixCloseTo(result, A);
  });
});

describe('pseudoInverseInto / pseudoInverse — tall / wide / rank-deficient', () => {
  test('tall full-column-rank matrix는 Moore-Penrose property A*A^+*A = A를 만족한다', () => {
    const A = [
      [1, 0],
      [0, 1],
      [1, 1],
    ];
    const pinv = pseudoInverse(A);
    expect(pinv).toBeDefined();
    if (pinv === undefined) return;
    // pinv는 (n x m) = (2 x 3).
    expect(pinv.length).toBe(2);
    expect(pinv[0].length).toBe(3);
    const product = multiplyMatrices(multiplyMatrices(A, pinv), A);
    expectMatrixCloseTo(product, A);
    // A^+ * A = I_2 (full column rank).
    const ata = multiplyMatrices(pinv, A);
    expectMatrixCloseTo(ata, [
      [1, 0],
      [0, 1],
    ]);
  });

  test('wide full-row-rank matrix도 Moore-Penrose property를 만족한다', () => {
    const A = [
      [1, 2, 0],
      [0, 1, 1],
    ];
    const pinv = pseudoInverse(A);
    expect(pinv).toBeDefined();
    if (pinv === undefined) return;
    expect(pinv.length).toBe(3);
    expect(pinv[0].length).toBe(2);
    const product = multiplyMatrices(multiplyMatrices(A, pinv), A);
    expectMatrixCloseTo(product, A);
    // A * A^+ = I_2 (full row rank).
    const aat = multiplyMatrices(A, pinv);
    expectMatrixCloseTo(aat, [
      [1, 0],
      [0, 1],
    ]);
  });

  test('rank-deficient matrix는 zero singular value를 제외한 pseudo-inverse를 반환한다', () => {
    // row 2 = row 1 * 2 → rank 1.
    const A = [
      [1, 2, 3],
      [2, 4, 6],
    ];
    const pinv = pseudoInverse(A);
    expect(pinv).toBeDefined();
    if (pinv === undefined) return;
    expect(pinv.length).toBe(3);
    expect(pinv[0].length).toBe(2);
    // Moore-Penrose property A*A^+*A = A.
    const product = multiplyMatrices(multiplyMatrices(A, pinv), A);
    expectMatrixCloseTo(product, A);
    // A^+*A*A^+ = A^+.
    const reverse = multiplyMatrices(multiplyMatrices(pinv, A), pinv);
    expectMatrixCloseTo(reverse, pinv);
    // 모든 entry finite.
    for (const row of pinv) {
      for (const v of row) {
        expect(Number.isFinite(v)).toBe(true);
      }
    }
  });

  test('zero matrix의 pseudo-inverse는 zero matrix n x m이다', () => {
    const A = [
      [0, 0, 0],
      [0, 0, 0],
    ];
    const pinv = pseudoInverse(A);
    expect(pinv).toBeDefined();
    if (pinv === undefined) return;
    expect(pinv.length).toBe(3);
    for (const row of pinv) {
      expect(row.length).toBe(2);
      for (const v of row) {
        expect(v).toBe(0);
      }
    }
  });

  test('빈 matrix []는 []를 반환한다', () => {
    const result = pseudoInverse([]);
    expect(result).toEqual([]);
  });
});

describe('pseudoInverseInto / pseudoInverse — Moore-Penrose property general', () => {
  test('(A*A^+)와 (A^+*A)는 symmetric이다', () => {
    const A = [
      [3, 2, 2],
      [2, 3, -2],
    ];
    const pinv = pseudoInverse(A);
    expect(pinv).toBeDefined();
    if (pinv === undefined) return;
    const aap = multiplyMatrices(A, pinv);
    const aapT = transpose(aap);
    expectMatrixCloseTo(aap, aapT);
    const apa = multiplyMatrices(pinv, A);
    const apaT = transpose(apa);
    expectMatrixCloseTo(apa, apaT);
  });
});

describe('pseudoInverseInto — SVD failure / invalid input', () => {
  test('maxIterations 1은 미수렴으로 undefined를 반환하고 out 미수정', () => {
    const A = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10],
    ];
    const out = makeOut(3, 3);
    const sentinel = makeOut(3, 3).map((row) => row.slice());
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        out[r][c] = 42;
        sentinel[r][c] = 42;
      }
    }
    const result = pseudoInverseInto(out, A, { maxIterations: 1 });
    expect(result).toBeUndefined();
    expect(out).toEqual(sentinel);
  });

  test('invalid options.maxIterations는 RangeError, out 미수정', () => {
    const out = makeOut(2, 2);
    expect(() =>
      pseudoInverseInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        { maxIterations: 0 }
      )
    ).toThrow(RangeError);
    expect(out).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  test('invalid options.tolerance는 RangeError', () => {
    expect(() =>
      pseudoInverse(
        [
          [1, 2],
          [3, 4],
        ],
        { tolerance: -1 }
      )
    ).toThrow(RangeError);
  });

  test('invalid options.epsilon은 RangeError', () => {
    expect(() =>
      pseudoInverse(
        [
          [1, 2],
          [3, 4],
        ],
        { epsilon: Number.POSITIVE_INFINITY }
      )
    ).toThrow(RangeError);
  });

  test('invalid options가 input matrix 검증보다 먼저 실패한다', () => {
    expect(() =>
      pseudoInverse(
        [
          [1, 2],
          [3, 4, 5],
        ],
        { maxIterations: 0 }
      )
    ).toThrow(/maxIterations/);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() => pseudoInverse([[1, 2], [3]])).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => pseudoInverse([[1, Number.NaN]])).toThrow(RangeError);
    expect(() => pseudoInverse([[1, Number.POSITIVE_INFINITY]])).toThrow(RangeError);
    expect(() => pseudoInverse([[1, Number.NEGATIVE_INFINITY]])).toThrow(RangeError);
  });

  test('one-sided zero shape [[]]는 RangeError', () => {
    expect(() => pseudoInverse([[]])).toThrow(RangeError);
  });
});

describe('pseudoInverseInto — output capacity / aliasing / -0', () => {
  test('out row 부족은 RangeError + 미수정', () => {
    const A = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    // pinv shape = 3x2. out 2x2 (rows 부족).
    const out = makeOut(2, 2);
    const sentinel = [
      [0, 0],
      [0, 0],
    ];
    expect(() => pseudoInverseInto(out, A)).toThrow(RangeError);
    expect(out).toEqual(sentinel);
  });

  test('out row capacity 부족은 RangeError + 미수정', () => {
    const A = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    // pinv shape = 3x2. row capacity 1 (column 부족).
    const out: number[][] = [[0], [0], [0]];
    const sentinel: number[][] = [[0], [0], [0]];
    expect(() => pseudoInverseInto(out, A)).toThrow(RangeError);
    expect(out).toEqual(sentinel);
  });

  test('out === matrix aliasing은 temp commit으로 안전하다', () => {
    // square invertible matrix를 alias로 in-place 계산.
    const A: number[][] = [
      [4, 7],
      [2, 6],
    ];
    const result = pseudoInverseInto(A, A);
    expect(result).toBe(A);
    expectMatrixCloseTo(A, [
      [0.6, -0.7],
      [-0.2, 0.4],
    ]);
  });

  test('결과 entry에 -0이 남지 않는다', () => {
    // diag(-2, 2) pseudo-inverse = diag(-1/2, 1/2). off-diagonal은 +0이어야 한다.
    const A = [
      [-2, 0],
      [0, 2],
    ];
    const result = pseudoInverse(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    for (const row of result) {
      for (const v of row) {
        expect(Object.is(v, -0)).toBe(false);
      }
    }
  });

  test('pseudoInverse companion은 입력 row 참조를 공유하지 않는다', () => {
    const A: number[][] = [
      [1, 0],
      [0, 1],
    ];
    const result = pseudoInverse(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result).not.toBe(A);
    for (let r = 0; r < A.length; r++) {
      expect(result[r]).not.toBe(A[r]);
    }
  });
});
