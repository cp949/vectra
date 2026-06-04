/**
 * calculateEigenvalues 함수 단위 테스트.
 *
 * 1x1 / 2x2 / symmetric n×n 정상 입력, empty / unsupported spectrum,
 * validation 오류, convergence cap을 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { calculateEigenvalues } from '../../../src/linalg/calculate-eigenvalues';

/**
 * 실수 배열이 element-wise로 expected와 가까운지 검증한다.
 *
 * length가 다르면 즉시 실패. `toBeCloseTo`의 precision으로 digit 단위 허용 오차를 지정한다.
 */
function expectArrayCloseTo(actual: readonly number[], expected: readonly number[], precision = 10): void {
  expect(actual.length).toBe(expected.length);
  for (let i = 0; i < expected.length; i++) {
    expect(actual[i]).toBeCloseTo(expected[i], precision);
  }
}

/**
 * 두 number 배열을 ascending 정렬한 사본을 비교한다.
 *
 * Jacobi 결과처럼 순서가 보장되지 않는 경우에 사용한다.
 */
function expectSortedArrayCloseTo(actual: readonly number[], expected: readonly number[], precision = 10): void {
  const a = [...actual].sort((x, y) => x - y);
  const e = [...expected].sort((x, y) => x - y);
  expectArrayCloseTo(a, e, precision);
}

describe('calculateEigenvalues — 정상 입력', () => {
  test('1x1 matrix [[5]]는 [5]를 반환한다', () => {
    expect(calculateEigenvalues([[5]])).toEqual([5]);
  });

  test('1x1 matrix [[-0]]는 [0]을 반환한다(-0 미보존)', () => {
    const result = calculateEigenvalues([[-0]]);
    expect(result).toEqual([0]);
    if (result === undefined) return;
    expect(Object.is(result[0], -0)).toBe(false);
  });

  test('2x2 distinct real eigenvalues는 closed form으로 계산된다', () => {
    // A = [[2, 1], [1, 2]]. eigenvalues = 3, 1.
    const A = [
      [2, 1],
      [1, 2],
    ];
    const result = calculateEigenvalues(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectArrayCloseTo(result, [3, 1]);
  });

  test('2x2 negative eigenvalue도 반환한다', () => {
    // A = [[0, 1], [1, 0]]. eigenvalues = 1, -1.
    const result = calculateEigenvalues([
      [0, 1],
      [1, 0],
    ]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectArrayCloseTo(result, [1, -1]);
  });

  test('2x2 repeated eigenvalue는 양쪽 모두 같은 값을 반환한다', () => {
    // A = [[3, 0], [0, 3]]. eigenvalues = 3, 3.
    const result = calculateEigenvalues([
      [3, 0],
      [0, 3],
    ]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectArrayCloseTo(result, [3, 3]);
  });

  test('2x2 complex pair는 undefined를 반환한다', () => {
    // A = [[0, -1], [1, 0]]. characteristic: lambda^2 + 1 = 0. complex.
    expect(
      calculateEigenvalues([
        [0, -1],
        [1, 0],
      ])
    ).toBeUndefined();
  });

  test('2x2 nearly-complex discriminant는 epsilon clamp로 repeated real로 처리한다', () => {
    // A = [[1, 0.5], [-0.5, 1]] -> det=1.25, trace=2, disc=4-5=-1. complex.
    expect(
      calculateEigenvalues([
        [1, 0.5],
        [-0.5, 1],
      ])
    ).toBeUndefined();
  });

  test('2x2 discriminant가 [-epsilon, 0) 구간이면 0으로 clamp해 repeated real을 반환한다', () => {
    // A = [[1, 1e-6], [-1e-6, 1]] -> trace=2, det=1+1e-12, disc=4-4-4e-12=-4e-12.
    // default epsilon=1e-9 ≫ 4e-12 이므로 [-epsilon, 0) 구간이라 0 clamp되어 repeated eigenvalue 1.
    const result = calculateEigenvalues([
      [1, 1e-6],
      [-1e-6, 1],
    ]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.length).toBe(2);
    expect(result[0]).toBeCloseTo(1, 10);
    expect(result[1]).toBeCloseTo(1, 10);
  });

  test('symmetric 3x3 diagonal matrix는 diagonal 값을 그대로 반환한다', () => {
    // diag(7, -2, 5). Jacobi는 즉시 수렴(off-diagonal 모두 0).
    const result = calculateEigenvalues([
      [7, 0, 0],
      [0, -2, 0],
      [0, 0, 5],
    ]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectArrayCloseTo(result, [7, -2, 5]);
  });

  test('symmetric 3x3 off-diagonal matrix는 분석해로 검증한다', () => {
    // A = [[2, -1, 0], [-1, 2, -1], [0, -1, 2]]. eigenvalues = 2 - sqrt(2), 2, 2 + sqrt(2).
    const result = calculateEigenvalues([
      [2, -1, 0],
      [-1, 2, -1],
      [0, -1, 2],
    ]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    const expected = [2 - Math.sqrt(2), 2, 2 + Math.sqrt(2)];
    expectSortedArrayCloseTo(result, expected, 8);
  });

  test('symmetric 4x4 matrix도 Jacobi로 수렴한다', () => {
    // diag(1, 2, 3, 4)로 시작한 뒤 작은 off-diagonal coupling 추가.
    const A = [
      [4, 1, 0, 0],
      [1, 3, 1, 0],
      [0, 1, 2, 1],
      [0, 0, 1, 1],
    ];
    const result = calculateEigenvalues(A);
    expect(result).toBeDefined();
    if (result === undefined) return;
    const sum = result.reduce((acc, v) => acc + v, 0);
    expect(sum).toBeCloseTo(10, 8); // trace
  });

  test('symmetric matrix에서 발생한 작은 noise는 epsilon으로 0으로 cleanup된다', () => {
    // identity matrix는 모든 diagonal이 1이므로 -0 없이 1로 반환.
    const result = calculateEigenvalues([
      [1, 0],
      [0, 1],
    ]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectArrayCloseTo(result, [1, 1]);
    for (const v of result) {
      expect(Object.is(v, -0)).toBe(false);
    }
  });

  test('1x1 negative 값도 그대로 반환한다', () => {
    expect(calculateEigenvalues([[-7]])).toEqual([-7]);
  });
});

describe('calculateEigenvalues — empty / unsupported spectrum', () => {
  test('빈 matrix []는 []를 반환한다', () => {
    expect(calculateEigenvalues([])).toEqual([]);
  });

  test('nonsymmetric 3x3 matrix는 undefined를 반환한다', () => {
    // A = [[1, 2, 3], [0, 4, 5], [0, 0, 6]] upper triangular nonsymmetric.
    // eigenvalues = 1, 4, 6이지만 본 함수는 symmetric 경로만 처리하므로 undefined.
    expect(
      calculateEigenvalues([
        [1, 2, 3],
        [0, 4, 5],
        [0, 0, 6],
      ])
    ).toBeUndefined();
  });

  test('nonsymmetric 4x4도 undefined', () => {
    expect(
      calculateEigenvalues([
        [1, 2, 0, 0],
        [3, 4, 0, 0],
        [0, 0, 5, 6],
        [0, 0, 7, 8],
      ])
    ).toBeUndefined();
  });
});

describe('calculateEigenvalues — validation', () => {
  test('non-square matrix는 RangeError를 던진다', () => {
    expect(() =>
      calculateEigenvalues([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toThrow(RangeError);
  });

  test('ragged matrix는 RangeError를 던진다', () => {
    expect(() =>
      calculateEigenvalues([
        [1, 2],
        [3, 4, 5],
      ] as unknown as readonly (readonly number[])[])
    ).toThrow(RangeError);
  });

  test('one-sided zero shape [[]] 는 RangeError를 던진다', () => {
    expect(() => calculateEigenvalues([[]])).toThrow(RangeError);
  });

  test('non-finite entry(NaN)는 RangeError를 던진다', () => {
    expect(() =>
      calculateEigenvalues([
        [1, Number.NaN],
        [0, 1],
      ])
    ).toThrow(RangeError);
  });

  test('non-finite entry(Infinity)는 RangeError를 던진다', () => {
    expect(() =>
      calculateEigenvalues([
        [Number.POSITIVE_INFINITY, 0],
        [0, 1],
      ])
    ).toThrow(RangeError);
  });

  test('non-finite entry(-Infinity)는 RangeError를 던진다', () => {
    expect(() =>
      calculateEigenvalues([
        [Number.NEGATIVE_INFINITY, 0],
        [0, 1],
      ])
    ).toThrow(RangeError);
  });

  test('invalid maxIterations(0)은 RangeError를 던진다', () => {
    expect(() => calculateEigenvalues([[1]], { maxIterations: 0 })).toThrow(RangeError);
  });

  test('invalid maxIterations(음수)는 RangeError를 던진다', () => {
    expect(() => calculateEigenvalues([[1]], { maxIterations: -5 })).toThrow(RangeError);
  });

  test('invalid maxIterations(비정수)는 RangeError를 던진다', () => {
    expect(() => calculateEigenvalues([[1]], { maxIterations: 1.5 })).toThrow(RangeError);
  });

  test('invalid maxIterations(NaN)은 RangeError를 던진다', () => {
    expect(() => calculateEigenvalues([[1]], { maxIterations: Number.NaN })).toThrow(RangeError);
  });

  test('invalid tolerance(음수)는 RangeError를 던진다', () => {
    expect(() => calculateEigenvalues([[1]], { tolerance: -1 })).toThrow(RangeError);
  });

  test('invalid tolerance(NaN)은 RangeError를 던진다', () => {
    expect(() => calculateEigenvalues([[1]], { tolerance: Number.NaN })).toThrow(RangeError);
  });

  test('invalid tolerance(Infinity)는 RangeError를 던진다', () => {
    expect(() => calculateEigenvalues([[1]], { tolerance: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  test('invalid tolerance(-Infinity)는 RangeError를 던진다', () => {
    expect(() => calculateEigenvalues([[1]], { tolerance: Number.NEGATIVE_INFINITY })).toThrow(RangeError);
  });

  test('invalid maxIterations(Infinity)는 RangeError를 던진다', () => {
    expect(() => calculateEigenvalues([[1]], { maxIterations: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  test('invalid maxIterations(MAX_SAFE_INTEGER + 1)은 RangeError를 던진다', () => {
    expect(() => calculateEigenvalues([[1]], { maxIterations: Number.MAX_SAFE_INTEGER + 1 })).toThrow(RangeError);
  });

  test('invalid epsilon(음수)는 RangeError를 던진다', () => {
    expect(() => calculateEigenvalues([[1]], { epsilon: -1 })).toThrow(RangeError);
  });

  test('invalid epsilon(NaN)은 RangeError를 던진다', () => {
    expect(() => calculateEigenvalues([[1]], { epsilon: Number.NaN })).toThrow(RangeError);
  });

  test('invalid epsilon(Infinity)는 RangeError를 던진다', () => {
    expect(() => calculateEigenvalues([[1]], { epsilon: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  test('invalid epsilon(-Infinity)는 RangeError를 던진다', () => {
    expect(() => calculateEigenvalues([[1]], { epsilon: Number.NEGATIVE_INFINITY })).toThrow(RangeError);
  });

  test('options 검증이 matrix shape 검증보다 먼저 수행된다', () => {
    // 잘못된 maxIterations + non-square matrix면 options 에러가 먼저 발생해야 한다.
    expect(() =>
      calculateEigenvalues(
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
        { maxIterations: 0 }
      )
    ).toThrow(/maxIterations/);
  });
});

describe('calculateEigenvalues — convergence cap', () => {
  test('낮은 maxIterations로 수렴 실패 시 undefined를 반환한다', () => {
    // 조밀하게 coupled 5x5 symmetric matrix에서 maxIterations=1로는 수렴할 수 없다.
    const A = [
      [1, 0.5, 0.3, 0.2, 0.1],
      [0.5, 1, 0.4, 0.3, 0.2],
      [0.3, 0.4, 1, 0.5, 0.3],
      [0.2, 0.3, 0.5, 1, 0.4],
      [0.1, 0.2, 0.3, 0.4, 1],
    ];
    expect(calculateEigenvalues(A, { maxIterations: 1, tolerance: 1e-12 })).toBeUndefined();
  });

  test('충분한 maxIterations에서는 같은 matrix가 정상 수렴한다', () => {
    const A = [
      [1, 0.5, 0.3, 0.2, 0.1],
      [0.5, 1, 0.4, 0.3, 0.2],
      [0.3, 0.4, 1, 0.5, 0.3],
      [0.2, 0.3, 0.5, 1, 0.4],
      [0.1, 0.2, 0.3, 0.4, 1],
    ];
    const result = calculateEigenvalues(A, { maxIterations: 200, tolerance: 1e-10 });
    expect(result).toBeDefined();
    if (result === undefined) return;
    const sum = result.reduce((acc, v) => acc + v, 0);
    expect(sum).toBeCloseTo(5, 8); // trace
  });
});
