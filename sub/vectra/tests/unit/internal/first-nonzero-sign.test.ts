/**
 * internal first-nonzero-sign 단위 테스트.
 *
 * 첫 strict non-zero entry의 부호를 vector와 matrix column에서 같은 규칙으로 찾는지 검증한다.
 * 0, -0, NaN, 전부 0인 입력의 처리를 함께 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { firstNonZeroSign, firstNonZeroSignOfColumn } from '../../../src/internal/first-nonzero-sign';

/**
 * vector를 column 하나짜리 matrix로 바꾼다.
 *
 * 두 helper가 같은 입력에서 같은 부호를 내는지 비교할 때 쓴다.
 */
function asColumn(values: readonly number[]): number[][] {
  return values.map((v) => [v]);
}

describe('internal first-nonzero-sign — firstNonZeroSign', () => {
  test('첫 non-zero가 양수이면 1을 반환한다', () => {
    expect(firstNonZeroSign([3, -1, 2])).toBe(1);
  });

  test('첫 non-zero가 음수이면 -1을 반환한다', () => {
    expect(firstNonZeroSign([-3, 1, 2])).toBe(-1);
  });

  test('앞의 0과 -0을 건너뛰고 첫 non-zero의 부호를 쓴다', () => {
    expect(firstNonZeroSign([0, -0, -2, 5])).toBe(-1);
    expect(firstNonZeroSign([-0, 0, 2, -5])).toBe(1);
  });

  test('이후 entry의 부호는 보지 않는다', () => {
    expect(firstNonZeroSign([0, 1, -9])).toBe(1);
    expect(firstNonZeroSign([0, -1, 9])).toBe(-1);
  });

  test('모든 entry가 0 또는 -0이면 1을 반환한다', () => {
    expect(firstNonZeroSign([0, 0, 0])).toBe(1);
    expect(firstNonZeroSign([-0, -0])).toBe(1);
  });

  test('빈 vector는 1을 반환한다', () => {
    expect(firstNonZeroSign([])).toBe(1);
  });

  test('NaN은 첫 non-zero로 보고 1을 반환한다', () => {
    expect(firstNonZeroSign([Number.NaN, -1])).toBe(1);
    expect(firstNonZeroSign([0, Number.NaN, -1])).toBe(1);
  });

  test('Infinity의 부호를 따른다', () => {
    expect(firstNonZeroSign([0, Number.NEGATIVE_INFINITY])).toBe(-1);
    expect(firstNonZeroSign([0, Number.POSITIVE_INFINITY])).toBe(1);
  });

  test('typed array도 받는다', () => {
    expect(firstNonZeroSign(new Float64Array([0, -4, 1]))).toBe(-1);
  });
});

describe('internal first-nonzero-sign — firstNonZeroSignOfColumn', () => {
  test('지정한 column의 첫 non-zero 부호를 반환한다', () => {
    const matrix = [
      [1, -2, 0],
      [-3, 4, 0],
    ];
    expect(firstNonZeroSignOfColumn(matrix, 0, 2)).toBe(1);
    expect(firstNonZeroSignOfColumn(matrix, 1, 2)).toBe(-1);
  });

  test('앞의 0과 -0 row를 건너뛴다', () => {
    const matrix = [[0], [-0], [-5], [7]];
    expect(firstNonZeroSignOfColumn(matrix, 0, 4)).toBe(-1);
  });

  test('전부 0인 column은 1을 반환한다', () => {
    const matrix = [
      [0, 1],
      [-0, -1],
    ];
    expect(firstNonZeroSignOfColumn(matrix, 0, 2)).toBe(1);
  });

  test('n 이후 row는 보지 않는다', () => {
    const matrix = [[0], [0], [-1]];
    expect(firstNonZeroSignOfColumn(matrix, 0, 2)).toBe(1);
    expect(firstNonZeroSignOfColumn(matrix, 0, 3)).toBe(-1);
  });

  test('n이 0이면 1을 반환한다', () => {
    expect(firstNonZeroSignOfColumn([[-1]], 0, 0)).toBe(1);
  });

  test('NaN은 첫 non-zero로 보고 1을 반환한다', () => {
    expect(firstNonZeroSignOfColumn([[0], [Number.NaN], [-1]], 0, 3)).toBe(1);
  });

  test('같은 값이면 firstNonZeroSign과 같은 부호를 반환한다', () => {
    const cases = [[2, -1], [-2, 1], [0, -3], [-0, 0, 4], [0, 0], [Number.NaN, -1], []];
    for (const values of cases) {
      expect(firstNonZeroSignOfColumn(asColumn(values), 0, values.length)).toBe(firstNonZeroSign(values));
    }
  });
});
