/**
 * linalg determinant 함수의 단위 테스트.
 *
 * empty(1) / 1x1 / 2x2 / 3x3, row swap sign, singular(0), non-square RangeError,
 * custom epsilon singular 판정, diagonal product overflow RangeError, invalid epsilon,
 * non-finite entry를 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { determinant } from '../../../src/linalg/determinant';

describe('determinant', () => {
  test('빈 matrix는 1을 반환한다 (empty product identity)', () => {
    expect(determinant([])).toBe(1);
  });

  test('1x1 matrix는 단일 entry를 반환한다', () => {
    expect(determinant([[5]])).toBe(5);
    expect(determinant([[-3]])).toBe(-3);
  });

  test('1x1 matrix [[0]]은 singular로 0을 반환한다', () => {
    expect(determinant([[0]])).toBe(0);
  });

  test('2x2 matrix의 det를 row swap 없이 계산한다', () => {
    expect(
      determinant([
        [2, 0],
        [0, 3],
      ])
    ).toBeCloseTo(6, 12);
  });

  test('row swap이 발생할 때 2x2 matrix의 det를 정확히 계산한다', () => {
    // pivot column 0 max abs는 row 1 (|3|). swap 1번. det = -2.
    expect(
      determinant([
        [1, 2],
        [3, 4],
      ])
    ).toBeCloseTo(-2, 12);
  });

  test('row swap이 필요한 matrix에서 sign이 보존된다', () => {
    // [[0,1],[1,0]] → swap 1번, diag product = 1, det = -1.
    expect(
      determinant([
        [0, 1],
        [1, 0],
      ])
    ).toBeCloseTo(-1, 12);
  });

  test('3x3 matrix는 expansion 결과와 일치한다', () => {
    expect(
      determinant([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 10],
      ])
    ).toBeCloseTo(-3, 10);
    expect(
      determinant([
        [2, 0, 0],
        [0, 3, 0],
        [0, 0, 5],
      ])
    ).toBeCloseTo(30, 10);
  });

  test('singular 2x2 matrix는 0을 반환한다', () => {
    expect(
      determinant([
        [1, 2],
        [2, 4],
      ])
    ).toBe(0);
  });

  test('singular 3x3 matrix는 0을 반환한다', () => {
    expect(
      determinant([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
    ).toBeCloseTo(0, 8);
  });

  test('singular determinant는 +0이며 -0이 아니다', () => {
    // 잠재적으로 -0이 발생할 수 있는 케이스: swap odd + diag product = 0.
    const det = determinant([
      [0, 0],
      [1, 1],
    ]);
    expect(det).toBe(0);
    expect(Object.is(det, -0)).toBe(false);
  });

  test('non-square matrix는 RangeError를 던진다', () => {
    expect(() =>
      determinant([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'non-finite entry %s가 있으면 RangeError를 던진다',
    (bad) => {
      expect(() =>
        determinant([
          [bad, 0],
          [0, 1],
        ])
      ).toThrow(RangeError);
    }
  );

  test('custom epsilon으로 작은 pivot을 singular로 판정한다', () => {
    expect(
      determinant(
        [
          [1, 0],
          [0, 1e-12],
        ],
        { epsilon: 1e-9 }
      )
    ).toBe(0);
  });

  test('epsilon = 0이면 작은 finite entry도 그대로 곱한다', () => {
    expect(
      determinant(
        [
          [1, 0],
          [0, 1e-12],
        ],
        { epsilon: 0 }
      )
    ).toBeCloseTo(1e-12, 24);
  });

  test('diagonal product overflow는 RangeError', () => {
    // 1e200 * 1e200 = Infinity → 누적 product가 finite를 잃는다.
    expect(() =>
      determinant([
        [1e200, 0],
        [0, 1e200],
      ])
    ).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('유효하지 않은 epsilon %s는 RangeError를 던진다', (bad) => {
    expect(() => determinant([[1]], { epsilon: bad })).toThrow(RangeError);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() => determinant([[1, 2], [3]] as unknown as number[][])).toThrow(RangeError);
  });
});
