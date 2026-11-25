/**
 * linalg finite entry 검증 단위 테스트.
 *
 * matrix와 vector 검증이 number가 아니거나 유한하지 않은 entry를 거부하는지 고정한다.
 * 판정을 `typeof value === 'number' && value - value === 0`으로 구현해, `value - value === 0`만으로는
 * 통과하는 '1', null, true 같은 값을 놓치지 않는지가 핵심이다.
 */

import { describe, expect, test } from 'vitest';
import { luDecomposition } from '../../../src/linalg/lu-decomposition';
import { solveByGaussianElimination } from '../../../src/linalg/solve-by-gaussian-elimination';
import { solveWithLuFactorization } from '../../../src/linalg/solve-with-lu-factorization';
import type { LUFactorization } from '../../../src/linalg/types';

describe('finite entry 검증 — number가 아니거나 유한하지 않은 entry는 RangeError', () => {
  const invalidEntries: readonly [string, unknown][] = [
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
    ['문자열 "1"', '1'],
    ['null', null],
    ['undefined', undefined],
    ['true', true],
    ['BigInt', 1n],
    ['Number 객체', Object(1)],
  ];

  test.each(invalidEntries)(
    'A의 entry가 %s이면 solveByGaussianElimination과 luDecomposition이 RangeError',
    (_, bad) => {
      const A = [
        [2, 1],
        [1, 3],
      ];
      A[1][0] = bad as number;
      expect(() => solveByGaussianElimination(A, [1, 2])).toThrow(
        new RangeError(`A[1][0] must be a finite number, got ${String(bad)}`)
      );
      expect(() => luDecomposition(A)).toThrow(
        new RangeError(`matrix[1][0] must be a finite number, got ${String(bad)}`)
      );
    }
  );

  test.each(invalidEntries)('b의 entry가 %s이면 RangeError', (_, bad) => {
    const b = [1, 2];
    b[1] = bad as number;
    expect(() =>
      solveByGaussianElimination(
        [
          [2, 1],
          [1, 3],
        ],
        b
      )
    ).toThrow(new RangeError(`b[1] must be a finite number, got ${String(bad)}`));
  });

  test.each(invalidEntries)('factorization의 entry가 %s이면 solveWithLuFactorization이 RangeError', (_, bad) => {
    const factorization = luDecomposition([
      [2, 1],
      [1, 3],
    ]) as LUFactorization;
    factorization.upper[0][1] = bad as number;
    expect(() => solveWithLuFactorization(factorization, [1, 2])).toThrow(
      new RangeError(`factorization.upper[0][1] must be a finite number, got ${String(bad)}`)
    );
  });
});
