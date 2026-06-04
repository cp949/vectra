/**
 * linalg magic square factory unit test.
 */

import { describe, expect, test } from 'vitest';
import { magicSquare } from '../../../src/linalg/magic-square';
import { magicSquareInto } from '../../../src/linalg/magic-square-into';

// ---------------------------------------------------------------------------
// magicSquareInto / magicSquare
// ---------------------------------------------------------------------------

/**
 * matrix가 1..n*n을 한 번씩 사용하고 모든 row/column/diagonal sum이 magic constant와 같음을 검증한다.
 */
function expectMagicSquare(matrix: number[][], n: number): void {
  expect(matrix).toHaveLength(n);
  if (n === 0) {
    return;
  }
  const magicConstant = (n * (n * n + 1)) / 2;
  const seen = new Set<number>();
  for (let i = 0; i < n; i++) {
    expect(matrix[i]).toHaveLength(n);
    for (let j = 0; j < n; j++) {
      const v = matrix[i][j];
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(n * n);
      seen.add(v);
    }
  }
  expect(seen.size).toBe(n * n);
  for (let i = 0; i < n; i++) {
    let rowSum = 0;
    let colSum = 0;
    for (let j = 0; j < n; j++) {
      rowSum += matrix[i][j];
      colSum += matrix[j][i];
    }
    expect(rowSum).toBe(magicConstant);
    expect(colSum).toBe(magicConstant);
  }
  let diag1 = 0;
  let diag2 = 0;
  for (let i = 0; i < n; i++) {
    diag1 += matrix[i][i];
    diag2 += matrix[i][n - 1 - i];
  }
  expect(diag1).toBe(magicConstant);
  expect(diag2).toBe(magicConstant);
}

describe('magicSquareInto — magic square 생성 (Into)', () => {
  test('size 3는 Lo Shu convention [[8,1,6],[3,5,7],[4,9,2]]', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    magicSquareInto(out, 3);
    expect(out).toEqual([
      [8, 1, 6],
      [3, 5, 7],
      [4, 9, 2],
    ]);
  });

  test('size 1은 [[1]]', () => {
    const out: number[][] = [[9]];
    magicSquareInto(out, 1);
    expect(out).toEqual([[1]]);
  });

  test('size 0은 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9]];
    magicSquareInto(out, 0);
    expect(out).toEqual([]);
  });

  test('size 2는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() => magicSquareInto(out, 2)).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('size 4(doubly-even)는 magic constant 34를 만족한다', () => {
    const out: number[][] = Array.from({ length: 4 }, () => new Array<number>(4).fill(0));
    magicSquareInto(out, 4);
    expectMagicSquare(out, 4);
  });

  test('size 6(singly-even)은 magic constant 111을 만족한다', () => {
    const out: number[][] = Array.from({ length: 6 }, () => new Array<number>(6).fill(0));
    magicSquareInto(out, 6);
    expectMagicSquare(out, 6);
  });

  test('size 5(odd)는 magic constant 65를 만족한다', () => {
    const out: number[][] = Array.from({ length: 5 }, () => new Array<number>(5).fill(0));
    magicSquareInto(out, 5);
    expectMagicSquare(out, 5);
  });

  test.each([
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
  ])('비정수/음수/unsafe size %s는 RangeError', (size) => {
    const out: number[][] = [];
    expect(() => magicSquareInto(out, size)).toThrow(RangeError);
  });

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() => magicSquareInto(out, 3)).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });
});

describe('magicSquare — magic square 생성 (companion)', () => {
  test('size 3는 Lo Shu convention을 반환한다', () => {
    expect(magicSquare(3)).toEqual([
      [8, 1, 6],
      [3, 5, 7],
      [4, 9, 2],
    ]);
  });

  test('size 0은 [], size 1은 [[1]]', () => {
    expect(magicSquare(0)).toEqual([]);
    expect(magicSquare(1)).toEqual([[1]]);
  });

  test('size 2는 RangeError', () => {
    expect(() => magicSquare(2)).toThrow(RangeError);
  });

  test('size 4/6/7/8/10이 magic constant를 만족한다', () => {
    for (const n of [4, 6, 7, 8, 10]) {
      expectMagicSquare(magicSquare(n), n);
    }
  });

  test('비정수 size는 RangeError', () => {
    expect(() => magicSquare(2.5)).toThrow(RangeError);
  });
});
