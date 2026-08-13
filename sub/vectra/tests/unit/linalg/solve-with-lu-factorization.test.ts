/**
 * solveWithLuFactorization unit test.
 *
 * 정상 입력:
 *   — luDecomposition로 만든 LU factorization으로 A*x=b를 푼다 (2x2 / 3x3).
 *   — partial pivoting permutation이 적용된 system도 정확히 푼다.
 *   — empty factorization + empty b → `[]`.
 *   — 결과에 `-0`이 남지 않는다(Object.is로 검증).
 *   — input vector 참조를 공유하지 않는다.
 *
 * singular:
 *   — upper diagonal abs <= epsilon → undefined.
 *   — custom epsilon 이하 upper diagonal은 singular로 본다.
 *
 * validation:
 *   — shape mismatch / non-square / b.length mismatch / 비-삼각 / unit diagonal 위반 → RangeError.
 *   — permutation validation: non-array, wrong length, non-integer, out-of-range, duplicate → RangeError.
 *   — non-finite matrix entry / vector entry / invalid epsilon → RangeError.
 *   — 검증 순서: epsilon → structural.
 */

import { describe, expect, test } from 'vitest';
import { luDecomposition } from '../../../src/linalg/lu-decomposition';
import { solveWithLuFactorization } from '../../../src/linalg/solve-with-lu-factorization';
import type { LUFactorization } from '../../../src/linalg/types';

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

describe('solveWithLuFactorization — 정상 입력', () => {
  test('2x2 nonsingular matrix의 LU factorization으로 A*x=b를 푼다', () => {
    // A = [[4, 3], [6, 3]], b = [10, 12]. det(A) = -6.
    // A^-1 = (1/-6) * [[3, -3], [-6, 4]] = [[-1/2, 1/2], [1, -2/3]].
    // x = A^-1 * b = [(-1/2)*10 + (1/2)*12, 1*10 + (-2/3)*12] = [1, 2].
    const A = [
      [4, 3],
      [6, 3],
    ];
    const b = [10, 12];
    const fact = luDecomposition(A);
    expect(fact).toBeDefined();
    if (fact === undefined) return;
    const result = solveWithLuFactorization(fact, b);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectVectorCloseTo(result, [1, 2]);
  });

  test('3x3 partial pivoting이 필요한 matrix에서도 정확한 해를 반환한다', () => {
    // A는 첫 column에 0이 있어 partial pivoting이 필요하다.
    // A = [[0, 1, 2], [1, 0, 3], [2, 3, 0]], b = [3, 4, 5].
    // 정확한 해: x = [1, 1, 1].
    const A = [
      [0, 1, 2],
      [1, 0, 3],
      [2, 3, 0],
    ];
    const b = [3, 4, 5];
    const fact = luDecomposition(A);
    expect(fact).toBeDefined();
    if (fact === undefined) return;
    const result = solveWithLuFactorization(fact, b);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectVectorCloseTo(result, [1, 1, 1]);
  });

  test('permutation이 적용된 LU factorization에서 P*b가 올바르게 적용된다', () => {
    // 명시적 P=[1,0]을 사용해 row swap 후의 LU.
    // 원본 system: A = [[1, 2], [3, 4]], b = [5, 11]. 정확한 해: x = [1, 2].
    // P*A = [[3, 4], [1, 2]], P*b = [11, 5].
    // L = [[1, 0], [1/3, 1]], U = [[3, 4], [0, 2/3]].
    const fact: LUFactorization = {
      lower: [
        [1, 0],
        [1 / 3, 1],
      ],
      upper: [
        [3, 4],
        [0, 2 / 3],
      ],
      permutation: [1, 0],
      swaps: 1,
    };
    const result = solveWithLuFactorization(fact, [5, 11]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectVectorCloseTo(result, [1, 2]);
  });

  test('1x1 LU factorization으로 해를 푼다', () => {
    const fact = luDecomposition([[3]]);
    expect(fact).toBeDefined();
    if (fact === undefined) return;
    const result = solveWithLuFactorization(fact, [9]);
    expect(result).toEqual([3]);
  });

  test('empty factorization + empty b는 empty solution을 반환한다', () => {
    const fact: LUFactorization = { lower: [], upper: [], permutation: [], swaps: 0 };
    expect(solveWithLuFactorization(fact, [])).toEqual([]);
  });

  test('결과는 새 number[] 인스턴스라 input vector 참조를 공유하지 않는다', () => {
    const fact = luDecomposition([
      [4, 3],
      [6, 3],
    ]);
    expect(fact).toBeDefined();
    if (fact === undefined) return;
    const b = [10, 12];
    const result = solveWithLuFactorization(fact, b);
    expect(result).toBeDefined();
    if (result === undefined) return;
    b[0] = 999;
    expectVectorCloseTo(result, [1, 2]);
  });

  test('결과에 -0이 남지 않는다', () => {
    // L = [[1, 0], [-3, 1]], U = [[2, 0], [0, 1]], permutation = [0, 1], b = [0, 0].
    // x = [0, 0]. forward sum, division 모두 0이 되도록 구성.
    const fact: LUFactorization = {
      lower: [
        [1, 0],
        [-3, 1],
      ],
      upper: [
        [2, 0],
        [0, 1],
      ],
      permutation: [0, 1],
      swaps: 0,
    };
    const result = solveWithLuFactorization(fact, [0, 0]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(Object.is(result[0], -0)).toBe(false);
    expect(Object.is(result[1], -0)).toBe(false);
    expect(Object.is(result[0], 0)).toBe(true);
    expect(Object.is(result[1], 0)).toBe(true);
  });
});

describe('solveWithLuFactorization — singular', () => {
  test('upper diagonal abs가 epsilon 이하이면 undefined', () => {
    const fact: LUFactorization = {
      lower: [
        [1, 0],
        [0, 1],
      ],
      upper: [
        [2, 3],
        [0, 0],
      ],
      permutation: [0, 1],
      swaps: 0,
    };
    expect(solveWithLuFactorization(fact, [4, 5])).toBeUndefined();
  });

  test('custom epsilon 이하 upper diagonal은 singular로 본다', () => {
    const fact: LUFactorization = {
      lower: [
        [1, 0],
        [0, 1],
      ],
      upper: [
        [2, 0],
        [0, 1e-6],
      ],
      permutation: [0, 1],
      swaps: 0,
    };
    expect(solveWithLuFactorization(fact, [1, 1], { epsilon: 1e-3 })).toBeUndefined();
  });
});

describe('solveWithLuFactorization — validation', () => {
  test('lower와 upper의 dimension이 다르면 RangeError', () => {
    const fact: LUFactorization = {
      lower: [[1]],
      upper: [
        [1, 0],
        [0, 1],
      ],
      permutation: [0],
      swaps: 0,
    };
    expect(() => solveWithLuFactorization(fact, [1])).toThrow(RangeError);
  });

  test('lower가 non-square면 RangeError', () => {
    const fact: LUFactorization = {
      lower: [
        [1, 0, 0],
        [0, 1, 0],
      ],
      upper: [
        [1, 2],
        [0, 1],
      ],
      permutation: [0, 1],
      swaps: 0,
    };
    expect(() => solveWithLuFactorization(fact, [1, 2])).toThrow(RangeError);
  });

  test('upper가 non-square면 RangeError', () => {
    const fact: LUFactorization = {
      lower: [
        [1, 0],
        [0, 1],
      ],
      upper: [
        [1, 2, 3],
        [0, 1, 2],
      ],
      permutation: [0, 1],
      swaps: 0,
    };
    expect(() => solveWithLuFactorization(fact, [1, 2])).toThrow(RangeError);
  });

  test('lower의 upper 영역에 epsilon보다 큰 entry가 있으면 RangeError', () => {
    const fact: LUFactorization = {
      lower: [
        [1, 5],
        [2, 1],
      ],
      upper: [
        [1, 2],
        [0, 1],
      ],
      permutation: [0, 1],
      swaps: 0,
    };
    expect(() => solveWithLuFactorization(fact, [1, 2])).toThrow(RangeError);
  });

  test('lower의 diagonal이 1이 아니면 RangeError', () => {
    const fact: LUFactorization = {
      lower: [
        [2, 0],
        [0, 1],
      ],
      upper: [
        [1, 2],
        [0, 1],
      ],
      permutation: [0, 1],
      swaps: 0,
    };
    expect(() => solveWithLuFactorization(fact, [1, 2])).toThrow(RangeError);
  });

  test('upper의 lower 영역에 epsilon보다 큰 entry가 있으면 RangeError', () => {
    const fact: LUFactorization = {
      lower: [
        [1, 0],
        [0, 1],
      ],
      upper: [
        [1, 2],
        [5, 1],
      ],
      permutation: [0, 1],
      swaps: 0,
    };
    expect(() => solveWithLuFactorization(fact, [1, 2])).toThrow(RangeError);
  });

  test('empty factorization이지만 b.length > 0이면 RangeError', () => {
    const fact: LUFactorization = { lower: [], upper: [], permutation: [], swaps: 0 };
    expect(() => solveWithLuFactorization(fact, [1])).toThrow(RangeError);
  });

  test('b.length가 n과 다르면 RangeError', () => {
    const fact: LUFactorization = {
      lower: [
        [1, 0],
        [0, 1],
      ],
      upper: [
        [1, 0],
        [0, 1],
      ],
      permutation: [0, 1],
      swaps: 0,
    };
    expect(() => solveWithLuFactorization(fact, [1])).toThrow(RangeError);
  });

  test('permutation이 array가 아니면 RangeError', () => {
    const fact = {
      lower: [
        [1, 0],
        [0, 1],
      ],
      upper: [
        [1, 0],
        [0, 1],
      ],
      permutation: 'not-array' as unknown as number[],
      swaps: 0,
    } as LUFactorization;
    expect(() => solveWithLuFactorization(fact, [1, 2])).toThrow(RangeError);
  });

  test('permutation length가 n과 다르면 RangeError', () => {
    const fact: LUFactorization = {
      lower: [
        [1, 0],
        [0, 1],
      ],
      upper: [
        [1, 0],
        [0, 1],
      ],
      permutation: [0, 1, 2],
      swaps: 0,
    };
    expect(() => solveWithLuFactorization(fact, [1, 2])).toThrow(RangeError);
  });

  test.each([0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'permutation entry %s가 비정수이면 RangeError',
    (bad) => {
      const fact: LUFactorization = {
        lower: [
          [1, 0],
          [0, 1],
        ],
        upper: [
          [1, 0],
          [0, 1],
        ],
        permutation: [0, bad],
        swaps: 0,
      };
      expect(() => solveWithLuFactorization(fact, [1, 2])).toThrow(RangeError);
    }
  );

  test.each([-1, 2, 3])('permutation entry %s가 범위를 벗어나면 RangeError', (bad) => {
    const fact: LUFactorization = {
      lower: [
        [1, 0],
        [0, 1],
      ],
      upper: [
        [1, 0],
        [0, 1],
      ],
      permutation: [0, bad],
      swaps: 0,
    };
    expect(() => solveWithLuFactorization(fact, [1, 2])).toThrow(RangeError);
  });

  test('permutation에 duplicate가 있으면 RangeError', () => {
    const fact: LUFactorization = {
      lower: [
        [1, 0],
        [0, 1],
      ],
      upper: [
        [1, 0],
        [0, 1],
      ],
      permutation: [0, 0],
      swaps: 0,
    };
    expect(() => solveWithLuFactorization(fact, [1, 2])).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'lower matrix entry %s는 RangeError',
    (bad) => {
      const fact: LUFactorization = {
        lower: [
          [1, 0],
          [bad, 1],
        ],
        upper: [
          [1, 0],
          [0, 1],
        ],
        permutation: [0, 1],
        swaps: 0,
      };
      expect(() => solveWithLuFactorization(fact, [1, 2])).toThrow(RangeError);
    }
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'upper matrix entry %s는 RangeError',
    (bad) => {
      const fact: LUFactorization = {
        lower: [
          [1, 0],
          [0, 1],
        ],
        upper: [
          [1, bad],
          [0, 1],
        ],
        permutation: [0, 1],
        swaps: 0,
      };
      expect(() => solveWithLuFactorization(fact, [1, 2])).toThrow(RangeError);
    }
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('b entry %s는 RangeError', (bad) => {
    const fact: LUFactorization = {
      lower: [
        [1, 0],
        [0, 1],
      ],
      upper: [
        [1, 0],
        [0, 1],
      ],
      permutation: [0, 1],
      swaps: 0,
    };
    expect(() => solveWithLuFactorization(fact, [bad, 1])).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('invalid epsilon %s는 RangeError', (bad) => {
    const fact: LUFactorization = {
      lower: [[1]],
      upper: [[1]],
      permutation: [0],
      swaps: 0,
    };
    expect(() => solveWithLuFactorization(fact, [1], { epsilon: bad })).toThrow(RangeError);
  });

  test('invalid epsilon은 structural 검증 전에 던진다', () => {
    // lower와 upper의 shape가 다르지만 epsilon 검증이 먼저 일어나야 한다.
    const fact: LUFactorization = {
      lower: [[1]],
      upper: [
        [1, 0],
        [0, 1],
      ],
      permutation: [0],
      swaps: 0,
    };
    expect(() => solveWithLuFactorization(fact, [1], { epsilon: -1 })).toThrow(/epsilon/);
  });
});
