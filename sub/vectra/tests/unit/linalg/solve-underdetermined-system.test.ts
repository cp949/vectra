import { describe, expect, test } from 'vitest';
import { solveUnderdeterminedSystem } from '../../../src/linalg/solve-underdetermined-system';

/** vector가 element-wise로 가까운지 검증한다. */
function expectVectorCloseTo(actual: readonly number[], expected: readonly number[], precision = 8): void {
  expect(actual.length).toBe(expected.length);
  for (let i = 0; i < expected.length; i++) {
    expect(actual[i]).toBeCloseTo(expected[i], precision);
  }
}

/** vector의 Euclidean norm. */
function vectorNorm(v: readonly number[]): number {
  let sum = 0;
  for (const x of v) sum += x * x;
  return Math.sqrt(sum);
}

describe('solveUnderdeterminedSystem — full-row-rank wide system', () => {
  test('1x2 system [1, 2] x = 5는 minimum-norm solution을 반환한다', () => {
    // A = [[1, 2]], b = [5]. minimum-norm은 [1, 2]^T * 5 / 5 = [1, 2]. norm = sqrt(5).
    const x = solveUnderdeterminedSystem([[1, 2]], [5]);
    expect(x).toBeDefined();
    if (x === undefined) return;
    expectVectorCloseTo(x, [1, 2]);
    // verify A x = b.
    expect(1 * x[0] + 2 * x[1]).toBeCloseTo(5, 10);
  });

  test('2x3 full-row-rank system은 exact minimum-norm solution을 반환한다', () => {
    const A = [
      [1, 0, 1],
      [0, 1, 1],
    ];
    const b = [1, 2];
    const x = solveUnderdeterminedSystem(A, b);
    expect(x).toBeDefined();
    if (x === undefined) return;
    // A * x = b 검증.
    expect(1 * x[0] + 0 * x[1] + 1 * x[2]).toBeCloseTo(1, 10);
    expect(0 * x[0] + 1 * x[1] + 1 * x[2]).toBeCloseTo(2, 10);
    // minimum-norm property: solution은 row space에 있어야 한다.
    // 모든 candidate y = x + n (n in null space)에 대해 ||x|| <= ||y||.
    // null space basis = [1, 1, -1] (정규화 전). x . n = 0 검증.
    const dot = x[0] + x[1] - x[2];
    expect(dot).toBeCloseTo(0, 8);
  });
});

describe('solveUnderdeterminedSystem — rank-deficient consistent', () => {
  test('row 의존 wide system은 minimum-norm exact solution을 반환한다', () => {
    // A = [[1, 2, 3], [2, 4, 6]] rank 1, b = [1, 2] consistent (b[1] = 2*b[0]).
    const A = [
      [1, 2, 3],
      [2, 4, 6],
    ];
    const b = [1, 2];
    const x = solveUnderdeterminedSystem(A, b);
    expect(x).toBeDefined();
    if (x === undefined) return;
    // A * x = b.
    expect(x[0] + 2 * x[1] + 3 * x[2]).toBeCloseTo(1, 10);
    expect(2 * x[0] + 4 * x[1] + 6 * x[2]).toBeCloseTo(2, 10);
    // minimum-norm: any other consistent solution has larger norm.
    // 다른 candidate x + [a, b, c]에서 [a, b, c] in nullspace.
    // nullspace는 {v: v . [1,2,3] = 0}. 예: v1 = [-2, 1, 0], v2 = [-3, 0, 1].
    const v1: number[] = [-2, 1, 0];
    const v2: number[] = [-3, 0, 1];
    const norm0 = vectorNorm(x);
    for (const t of [0.1, 0.5, -0.3]) {
      const candidate1 = [x[0] + t * v1[0], x[1] + t * v1[1], x[2] + t * v1[2]];
      const candidate2 = [x[0] + t * v2[0], x[1] + t * v2[1], x[2] + t * v2[2]];
      expect(vectorNorm(candidate1)).toBeGreaterThanOrEqual(norm0 - 1e-9);
      expect(vectorNorm(candidate2)).toBeGreaterThanOrEqual(norm0 - 1e-9);
    }
  });
});

describe('solveUnderdeterminedSystem — inconsistent', () => {
  test('rank-deficient inconsistent wide system은 undefined', () => {
    // A = [[1, 2, 3], [2, 4, 6]] rank 1. b = [1, 5] inconsistent (5 != 2*1).
    const A = [
      [1, 2, 3],
      [2, 4, 6],
    ];
    expect(solveUnderdeterminedSystem(A, [1, 5])).toBeUndefined();
  });

  test('residual이 epsilon 이하면 통과', () => {
    // 매우 작은 perturbation. epsilon보다 작은 RHS noise는 허용.
    const A = [[1, 2, 3]];
    const x = solveUnderdeterminedSystem(A, [1 + 1e-12], { epsilon: 1e-9 });
    expect(x).toBeDefined();
  });

  test('residual이 epsilon 초과이면 undefined', () => {
    // rank 1 wide system with inconsistent b. residual > epsilon이라 undefined.
    const A = [
      [1, 2, 3],
      [2, 4, 6],
    ];
    // b = [1, 2 + 1] residual ~ ?
    const x = solveUnderdeterminedSystem(A, [1, 3], { epsilon: 1e-9 });
    expect(x).toBeUndefined();
  });
});

describe('solveUnderdeterminedSystem — empty input', () => {
  test('A=[], b=[]는 []', () => {
    expect(solveUnderdeterminedSystem([], [])).toEqual([]);
  });

  test('A=[], b=[1]은 length mismatch RangeError', () => {
    expect(() => solveUnderdeterminedSystem([], [1])).toThrow(RangeError);
  });
});

describe('solveUnderdeterminedSystem — invalid shape', () => {
  test('square A는 RangeError', () => {
    expect(() =>
      solveUnderdeterminedSystem(
        [
          [1, 2],
          [3, 4],
        ],
        [1, 2]
      )
    ).toThrow(/A.rows < A.columns/);
  });

  test('tall A(rows > columns)는 RangeError', () => {
    expect(() => solveUnderdeterminedSystem([[1], [2], [3]], [1, 2, 3])).toThrow(/A.rows < A.columns/);
  });

  test('b.length 불일치는 RangeError', () => {
    expect(() => solveUnderdeterminedSystem([[1, 2, 3]], [1, 2])).toThrow(RangeError);
  });
});

describe('solveUnderdeterminedSystem — invalid input / SVD failure', () => {
  test('non-finite A entry는 RangeError', () => {
    expect(() => solveUnderdeterminedSystem([[1, Number.NaN, 3]], [1])).toThrow(RangeError);
    expect(() => solveUnderdeterminedSystem([[1, Number.POSITIVE_INFINITY, 3]], [1])).toThrow(RangeError);
    expect(() => solveUnderdeterminedSystem([[1, Number.NEGATIVE_INFINITY, 3]], [1])).toThrow(RangeError);
  });

  test('non-finite b entry는 RangeError', () => {
    expect(() => solveUnderdeterminedSystem([[1, 2, 3]], [Number.NaN])).toThrow(RangeError);
    expect(() => solveUnderdeterminedSystem([[1, 2, 3]], [Number.POSITIVE_INFINITY])).toThrow(RangeError);
    expect(() => solveUnderdeterminedSystem([[1, 2, 3]], [Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });

  test('invalid options는 RangeError', () => {
    expect(() => solveUnderdeterminedSystem([[1, 2, 3]], [1], { maxIterations: 0 })).toThrow(RangeError);
    expect(() => solveUnderdeterminedSystem([[1, 2, 3]], [1], { tolerance: -1 })).toThrow(RangeError);
    expect(() => solveUnderdeterminedSystem([[1, 2, 3]], [1], { epsilon: Number.NaN })).toThrow(RangeError);
  });

  test('SVD convergence cap은 undefined', () => {
    // ill-conditioned non-trivial wide matrix로 maxIterations 1 cap.
    const A = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 13],
    ];
    expect(solveUnderdeterminedSystem(A, [1, 2, 3], { maxIterations: 1 })).toBeUndefined();
  });

  test('ragged A는 RangeError', () => {
    expect(() => solveUnderdeterminedSystem([[1, 2], [3]], [1, 2])).toThrow(RangeError);
  });

  test('one-sided zero shape [[]]는 RangeError', () => {
    expect(() => solveUnderdeterminedSystem([[]], [])).toThrow(RangeError);
  });
});

describe('solveUnderdeterminedSystem — -0 canonicalize', () => {
  test('결과 entry에 -0이 남지 않는다', () => {
    // [[0, 1]] x = [0]. minimum-norm은 [0, 0]^T.
    // 실제 결과는 [0, 0]이 되어야 한다.
    const x = solveUnderdeterminedSystem([[1, 0]], [0]);
    expect(x).toBeDefined();
    if (x === undefined) return;
    for (const v of x) {
      expect(Object.is(v, -0)).toBe(false);
    }
  });
});
