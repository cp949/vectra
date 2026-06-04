/**
 * linalg rank 함수의 단위 테스트.
 *
 * empty(0), full rank, rank-deficient, rectangular wide/tall, all-zero, custom epsilon,
 * invalid epsilon, non-finite entry를 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { rank } from '../../../src/linalg/rank';

describe('rank', () => {
  test('빈 matrix는 0을 반환한다', () => {
    expect(rank([])).toBe(0);
  });

  test('all-zero matrix는 rank 0', () => {
    expect(
      rank([
        [0, 0],
        [0, 0],
      ])
    ).toBe(0);
  });

  test('독립적인 행으로 구성된 3x3 matrix는 rank 3을 반환한다', () => {
    expect(
      rank([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ])
    ).toBe(3);
    expect(
      rank([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 10],
      ])
    ).toBe(3);
  });

  test('행이 선형 종속인 2x2 matrix는 rank 1을 반환한다', () => {
    expect(
      rank([
        [1, 2],
        [2, 4],
      ])
    ).toBe(1);
  });

  test('모든 행이 선형 종속인 3x3 matrix는 rank 1을 반환한다', () => {
    expect(
      rank([
        [1, 2, 3],
        [2, 4, 6],
        [3, 6, 9],
      ])
    ).toBe(1);
  });

  test('한 행이 다른 두 행의 합인 3x3 matrix는 rank 2를 반환한다', () => {
    // 마지막 행 = 첫째 + 둘째.
    expect(
      rank([
        [1, 0, 0],
        [0, 1, 0],
        [1, 1, 0],
      ])
    ).toBe(2);
  });

  test('열이 행보다 많은 직사각형 matrix의 rank를 올바르게 계산한다', () => {
    expect(
      rank([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
      ])
    ).toBe(2);
    expect(
      rank([
        [1, 2, 3, 4],
        [2, 4, 6, 8],
      ])
    ).toBe(1);
  });

  test('행이 열보다 많은 직사각형 matrix의 rank를 올바르게 계산한다', () => {
    expect(
      rank([
        [1, 0],
        [0, 1],
        [1, 1],
      ])
    ).toBe(2);
    expect(
      rank([
        [1, 2],
        [2, 4],
        [3, 6],
      ])
    ).toBe(1);
  });

  test('custom epsilon으로 작은 pivot을 zero로 판정한다', () => {
    expect(
      rank(
        [
          [1e-12, 0],
          [0, 1e-12],
        ],
        { epsilon: 1e-9 }
      )
    ).toBe(0);
  });

  test('epsilon = 0이면 작은 finite entry도 pivot으로 본다', () => {
    expect(
      rank(
        [
          [1e-12, 0],
          [0, 1e-12],
        ],
        { epsilon: 0 }
      )
    ).toBe(2);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => rank([[Number.NaN, 0]])).toThrow(RangeError);
    expect(() => rank([[Number.POSITIVE_INFINITY]])).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, -0.5])('유효하지 않은 epsilon %s는 RangeError를 던진다', (bad) => {
    expect(() => rank([[1]], { epsilon: bad })).toThrow(RangeError);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() => rank([[1, 2], [3]] as unknown as number[][])).toThrow(RangeError);
  });
});
