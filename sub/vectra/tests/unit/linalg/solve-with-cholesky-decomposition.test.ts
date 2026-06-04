/**
 * solveWithCholeskyDecomposition unit test.
 *
 * 정상 입력:
 *   — choleskyDecomposition으로 만든 decomposition으로 SPD system을 푼다 (1x1 / 2x2 / 3x3).
 *   — empty decomposition + empty b → `[]`.
 *   — 결과에 `-0`이 남지 않는다(Object.is로 검증).
 *   — input vector 참조를 공유하지 않는다.
 *
 * singular:
 *   — lower diagonal abs <= epsilon → undefined.
 *   — custom epsilon 이하 diagonal은 singular로 본다.
 *
 * validation:
 *   — non-square / upper 영역 non-zero / b.length mismatch → RangeError.
 *   — non-finite entry / invalid epsilon → RangeError.
 *   — 누적 sum / division overflow → RangeError.
 *   — 검증 순서: epsilon → structural.
 */

import { describe, expect, test } from 'vitest';
import { choleskyDecomposition } from '../../../src/linalg/cholesky-decomposition';
import { solveWithCholeskyDecomposition } from '../../../src/linalg/solve-with-cholesky-decomposition';
import type { CholeskyDecomposition } from '../../../src/linalg/types';

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

describe('solveWithCholeskyDecomposition — 정상 입력', () => {
  test('1x1 SPD matrix의 decomposition으로 A*x=b를 푼다', () => {
    // A = [[4]], b = [12]. x = [3].
    const dec = choleskyDecomposition([[4]]);
    expect(dec).toBeDefined();
    if (dec === undefined) return;
    const result = solveWithCholeskyDecomposition(dec, [12]);
    expect(result).toEqual([3]);
  });

  test('2x2 SPD matrix의 decomposition으로 A*x=b를 푼다', () => {
    // A = [[4, 12], [12, 37]], b = [16, 50]. 정확한 해: A * [1, 1] = [16, 49] (안 맞음).
    // 다시: A * x = [16, 50] → x = A^-1 * [16, 50].
    // A^-1 = (1 / (4*37 - 144)) * [[37, -12], [-12, 4]] = (1/4) * [[37, -12], [-12, 4]].
    // x[0] = (37*16 - 12*50) / 4 = (592 - 600)/4 = -2.
    // x[1] = (-12*16 + 4*50) / 4 = (-192 + 200)/4 = 2.
    const A = [
      [4, 12],
      [12, 37],
    ];
    const dec = choleskyDecomposition(A);
    expect(dec).toBeDefined();
    if (dec === undefined) return;
    const result = solveWithCholeskyDecomposition(dec, [16, 50]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectVectorCloseTo(result, [-2, 2]);
  });

  test('3x3 SPD matrix의 decomposition으로 A*x=b를 푼다', () => {
    // A = [[4, 12, -16], [12, 37, -43], [-16, -43, 98]]. classic SPD example.
    // b = [0, 0, 0] → x = [0, 0, 0]은 trivial. 대신 b = A * [1, 1, 1] = [0, 6, 39].
    const A = [
      [4, 12, -16],
      [12, 37, -43],
      [-16, -43, 98],
    ];
    const dec = choleskyDecomposition(A);
    expect(dec).toBeDefined();
    if (dec === undefined) return;
    const b = [0, 6, 39];
    const result = solveWithCholeskyDecomposition(dec, b);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expectVectorCloseTo(result, [1, 1, 1]);
  });

  test('empty decomposition + empty b는 empty solution을 반환한다', () => {
    expect(solveWithCholeskyDecomposition({ lower: [] }, [])).toEqual([]);
  });

  test('결과는 새 number[] 인스턴스라 input vector 참조를 공유하지 않는다', () => {
    const dec = choleskyDecomposition([[4]]);
    expect(dec).toBeDefined();
    if (dec === undefined) return;
    const b = [12];
    const result = solveWithCholeskyDecomposition(dec, b);
    expect(result).toBeDefined();
    if (result === undefined) return;
    b[0] = 999;
    expect(result[0]).toBe(3);
  });

  test('결과에 -0이 남지 않는다', () => {
    // L = [[2, 0], [-3, 1]], b = [0, 0]. forward → y = [0, 0]. backward → x = [0, 0].
    // 모든 sum과 division이 0이라 -0 canonicalize 경로 확인.
    const dec: CholeskyDecomposition = {
      lower: [
        [2, 0],
        [-3, 1],
      ],
    };
    const result = solveWithCholeskyDecomposition(dec, [0, 0]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(Object.is(result[0], -0)).toBe(false);
    expect(Object.is(result[1], -0)).toBe(false);
    expect(Object.is(result[0], 0)).toBe(true);
    expect(Object.is(result[1], 0)).toBe(true);
  });
});

describe('solveWithCholeskyDecomposition — singular', () => {
  test('lower diagonal abs가 epsilon 이하이면 undefined', () => {
    const dec: CholeskyDecomposition = {
      lower: [
        [2, 0],
        [3, 0],
      ],
    };
    expect(solveWithCholeskyDecomposition(dec, [4, 5])).toBeUndefined();
  });

  test('custom epsilon 이하 diagonal은 singular로 본다', () => {
    const dec: CholeskyDecomposition = {
      lower: [
        [1e-6, 0],
        [3, 4],
      ],
    };
    expect(solveWithCholeskyDecomposition(dec, [1, 5], { epsilon: 1e-3 })).toBeUndefined();
  });
});

describe('solveWithCholeskyDecomposition — validation', () => {
  test('lower가 non-square면 RangeError', () => {
    const dec: CholeskyDecomposition = {
      lower: [
        [1, 0, 0],
        [0, 1, 0],
      ],
    };
    expect(() => solveWithCholeskyDecomposition(dec, [1, 2])).toThrow(RangeError);
  });

  test('lower의 upper 영역에 epsilon보다 큰 entry가 있으면 RangeError', () => {
    const dec: CholeskyDecomposition = {
      lower: [
        [2, 5],
        [3, 1],
      ],
    };
    expect(() => solveWithCholeskyDecomposition(dec, [1, 2])).toThrow(RangeError);
  });

  test('b.length가 n과 다르면 RangeError', () => {
    const dec: CholeskyDecomposition = {
      lower: [
        [1, 0],
        [0, 1],
      ],
    };
    expect(() => solveWithCholeskyDecomposition(dec, [1])).toThrow(RangeError);
  });

  test('empty decomposition이지만 b.length > 0이면 RangeError', () => {
    expect(() => solveWithCholeskyDecomposition({ lower: [] }, [1])).toThrow(RangeError);
  });

  test('ragged lower matrix는 RangeError', () => {
    const dec = {
      lower: [[1, 0], [2]],
    } as unknown as CholeskyDecomposition;
    expect(() => solveWithCholeskyDecomposition(dec, [1, 2])).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('lower entry %s는 RangeError', (bad) => {
    const dec: CholeskyDecomposition = {
      lower: [
        [1, 0],
        [bad, 1],
      ],
    };
    expect(() => solveWithCholeskyDecomposition(dec, [1, 2])).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('b entry %s는 RangeError', (bad) => {
    const dec: CholeskyDecomposition = {
      lower: [
        [1, 0],
        [0, 1],
      ],
    };
    expect(() => solveWithCholeskyDecomposition(dec, [bad, 1])).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('invalid epsilon %s는 RangeError', (bad) => {
    const dec: CholeskyDecomposition = { lower: [[1]] };
    expect(() => solveWithCholeskyDecomposition(dec, [1], { epsilon: bad })).toThrow(RangeError);
  });

  test('invalid epsilon은 structural 검증 전에 던진다', () => {
    // ragged lower인데 epsilon 검증이 먼저 일어나야 한다.
    const dec = { lower: [[1, 0], [2]] } as unknown as CholeskyDecomposition;
    expect(() => solveWithCholeskyDecomposition(dec, [1, 2], { epsilon: -1 })).toThrow(/epsilon/);
  });

  test('forward 누적 sum overflow는 RangeError', () => {
    const huge = Number.MAX_VALUE;
    const dec: CholeskyDecomposition = {
      lower: [
        [1, 0],
        [-huge, 1],
      ],
    };
    expect(() => solveWithCholeskyDecomposition(dec, [huge, huge])).toThrow(RangeError);
  });

  test('backward(transpose) 누적 sum overflow는 RangeError', () => {
    // L = [[1, 0], [huge, 1]]. forward: y[0] = b[0] = 0. y[1] = b[1] - huge*0 = b[1].
    // backward(L^T): x[1] = y[1] / 1 = y[1]. x[0] = (y[0] - L[1][0]*x[1]) / L[0][0] = -huge * b[1].
    // b[1] = huge면 huge*huge overflow.
    const huge = Number.MAX_VALUE;
    const dec: CholeskyDecomposition = {
      lower: [
        [1, 0],
        [huge, 1],
      ],
    };
    expect(() => solveWithCholeskyDecomposition(dec, [0, huge])).toThrow(RangeError);
  });

  test('division 결과 overflow는 RangeError', () => {
    // diagonal이 epsilon보다 크면서 작아 sum / diagonal이 Infinity.
    const huge = Number.MAX_VALUE;
    expect(() => solveWithCholeskyDecomposition({ lower: [[0.5]] }, [huge])).toThrow(RangeError);
  });
});
