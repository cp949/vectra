/**
 * calculus finite-difference matrix helper unit test.
 *
 * forwardDifferenceMatrix(Into) — binCount 0/1/2/4 layout, boundary row(backward fallback),
 *   invalid binCount, `out` atomicity(success truncate / failure preserve), capacity 부족.
 * backwardDifferenceMatrix(Into) — binCount 0/1/2/4 layout, boundary row(forward fallback),
 *   invalid binCount, `out` atomicity(success truncate / failure preserve), capacity 부족.
 * centralDifferenceMatrix(Into) — binCount 0/1/2/3/5 layout, 양쪽 boundary fallback(forward/backward)과
 *   middle central row, invalid binCount, `out` atomicity(success truncate / failure preserve), capacity 부족.
 */

import { describe, expect, test } from 'vitest';
import { backwardDifferenceMatrix } from '../../../src/calculus/backward-difference-matrix';
import { backwardDifferenceMatrixInto } from '../../../src/calculus/backward-difference-matrix-into';
import { centralDifferenceMatrix } from '../../../src/calculus/central-difference-matrix';
import { centralDifferenceMatrixInto } from '../../../src/calculus/central-difference-matrix-into';
import { forwardDifferenceMatrix } from '../../../src/calculus/forward-difference-matrix';
import { forwardDifferenceMatrixInto } from '../../../src/calculus/forward-difference-matrix-into';

const INVALID_BIN_COUNTS = [
  -1,
  0.5,
  Number.NaN,
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY,
  Number.MAX_SAFE_INTEGER + 1,
] as const;

// ---------------------------------------------------------------------------
// forwardDifferenceMatrix / forwardDifferenceMatrixInto
// ---------------------------------------------------------------------------

describe('forwardDifferenceMatrix — unit-grid forward 차분 행렬 (companion)', () => {
  test('binCount 0은 빈 행렬을 반환한다', () => {
    expect(forwardDifferenceMatrix(0)).toEqual([]);
  });

  test('binCount 1은 [[0]]을 반환한다 (boundary 표현 불가)', () => {
    expect(forwardDifferenceMatrix(1)).toEqual([[0]]);
  });

  test('binCount 2는 forward + boundary fallback이 동일한 row를 만든다', () => {
    expect(forwardDifferenceMatrix(2)).toEqual([
      [-1, 1],
      [-1, 1],
    ]);
  });

  test('binCount 4는 마지막 row가 backward one-sided fallback이다', () => {
    expect(forwardDifferenceMatrix(4)).toEqual([
      [-1, 1, 0, 0],
      [0, -1, 1, 0],
      [0, 0, -1, 1],
      [0, 0, -1, 1],
    ]);
  });

  test.each(INVALID_BIN_COUNTS)('invalid binCount %s는 RangeError', (binCount) => {
    expect(() => forwardDifferenceMatrix(binCount)).toThrow(RangeError);
  });
});

describe('forwardDifferenceMatrixInto — unit-grid forward 차분 행렬 (Into)', () => {
  test('out을 반환한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    const result = forwardDifferenceMatrixInto(out, 2);
    expect(result).toBe(out);
  });

  test('성공 시 기존 out을 target shape로 truncate한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    forwardDifferenceMatrixInto(out, 2);
    expect(out).toEqual([
      [-1, 1],
      [-1, 1],
    ]);
    expect(out.length).toBe(2);
    for (const row of out) {
      expect(row.length).toBe(2);
    }
  });

  test('binCount 0은 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9], [9]];
    forwardDifferenceMatrixInto(out, 0);
    expect(out).toEqual([]);
  });

  test('binCount 1은 [[0]]을 기록한다', () => {
    const out: number[][] = [[9]];
    forwardDifferenceMatrixInto(out, 1);
    expect(out).toEqual([[0]]);
  });

  test('binCount 4는 마지막 row가 backward one-sided fallback이다', () => {
    const out: number[][] = Array.from({ length: 4 }, () => new Array<number>(4).fill(9));
    forwardDifferenceMatrixInto(out, 4);
    expect(out).toEqual([
      [-1, 1, 0, 0],
      [0, -1, 1, 0],
      [0, 0, -1, 1],
      [0, 0, -1, 1],
    ]);
  });

  test.each(INVALID_BIN_COUNTS)('invalid binCount %s는 RangeError이고 out을 수정하지 않는다', (binCount) => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    const snapshot = out.map((row) => row.slice());
    expect(() => forwardDifferenceMatrixInto(out, binCount)).toThrow(RangeError);
    expect(out).toEqual(snapshot);
  });

  test('out row 개수가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() => forwardDifferenceMatrixInto(out, 2)).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out row가 array가 아니면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const notArray = 'not array' as unknown as number[];
    const out: number[][] = [[9, 9], notArray];
    expect(() => forwardDifferenceMatrixInto(out, 2)).toThrow(RangeError);
    expect(out[0]).toEqual([9, 9]);
    expect(out[1]).toBe(notArray);
    expect(out.length).toBe(2);
  });

  test('out row capacity가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9], [9]];
    expect(() => forwardDifferenceMatrixInto(out, 2)).toThrow(RangeError);
    expect(out).toEqual([[9, 9], [9]]);
  });
});

// ---------------------------------------------------------------------------
// backwardDifferenceMatrix / backwardDifferenceMatrixInto
// ---------------------------------------------------------------------------

describe('backwardDifferenceMatrix — unit-grid backward 차분 행렬 (companion)', () => {
  test('binCount 0은 빈 행렬을 반환한다', () => {
    expect(backwardDifferenceMatrix(0)).toEqual([]);
  });

  test('binCount 1은 [[0]]을 반환한다 (boundary 표현 불가)', () => {
    expect(backwardDifferenceMatrix(1)).toEqual([[0]]);
  });

  test('binCount 2는 forward fallback + backward가 동일한 row를 만든다', () => {
    expect(backwardDifferenceMatrix(2)).toEqual([
      [-1, 1],
      [-1, 1],
    ]);
  });

  test('binCount 4는 첫 row가 forward one-sided fallback이다', () => {
    expect(backwardDifferenceMatrix(4)).toEqual([
      [-1, 1, 0, 0],
      [-1, 1, 0, 0],
      [0, -1, 1, 0],
      [0, 0, -1, 1],
    ]);
  });

  test.each(INVALID_BIN_COUNTS)('invalid binCount %s는 RangeError', (binCount) => {
    expect(() => backwardDifferenceMatrix(binCount)).toThrow(RangeError);
  });
});

describe('backwardDifferenceMatrixInto — unit-grid backward 차분 행렬 (Into)', () => {
  test('out을 반환한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    const result = backwardDifferenceMatrixInto(out, 2);
    expect(result).toBe(out);
  });

  test('성공 시 기존 out을 target shape로 truncate한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    backwardDifferenceMatrixInto(out, 2);
    expect(out).toEqual([
      [-1, 1],
      [-1, 1],
    ]);
    expect(out.length).toBe(2);
    for (const row of out) {
      expect(row.length).toBe(2);
    }
  });

  test('binCount 0은 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9], [9]];
    backwardDifferenceMatrixInto(out, 0);
    expect(out).toEqual([]);
  });

  test('binCount 1은 [[0]]을 기록한다', () => {
    const out: number[][] = [[9]];
    backwardDifferenceMatrixInto(out, 1);
    expect(out).toEqual([[0]]);
  });

  test('binCount 4는 첫 row가 forward one-sided fallback이다', () => {
    const out: number[][] = Array.from({ length: 4 }, () => new Array<number>(4).fill(9));
    backwardDifferenceMatrixInto(out, 4);
    expect(out).toEqual([
      [-1, 1, 0, 0],
      [-1, 1, 0, 0],
      [0, -1, 1, 0],
      [0, 0, -1, 1],
    ]);
  });

  test.each(INVALID_BIN_COUNTS)('invalid binCount %s는 RangeError이고 out을 수정하지 않는다', (binCount) => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    const snapshot = out.map((row) => row.slice());
    expect(() => backwardDifferenceMatrixInto(out, binCount)).toThrow(RangeError);
    expect(out).toEqual(snapshot);
  });

  test('out row 개수가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() => backwardDifferenceMatrixInto(out, 2)).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out row가 array가 아니면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const notArray = 'not array' as unknown as number[];
    const out: number[][] = [[9, 9], notArray];
    expect(() => backwardDifferenceMatrixInto(out, 2)).toThrow(RangeError);
    expect(out[0]).toEqual([9, 9]);
    expect(out[1]).toBe(notArray);
    expect(out.length).toBe(2);
  });

  test('out row capacity가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9], [9]];
    expect(() => backwardDifferenceMatrixInto(out, 2)).toThrow(RangeError);
    expect(out).toEqual([[9, 9], [9]]);
  });
});

// ---------------------------------------------------------------------------
// centralDifferenceMatrix / centralDifferenceMatrixInto
// ---------------------------------------------------------------------------

describe('centralDifferenceMatrix — unit-grid central 차분 행렬 (companion)', () => {
  test('binCount 0은 빈 행렬을 반환한다', () => {
    expect(centralDifferenceMatrix(0)).toEqual([]);
  });

  test('binCount 1은 [[0]]을 반환한다 (boundary 표현 불가)', () => {
    expect(centralDifferenceMatrix(1)).toEqual([[0]]);
  });

  test('binCount 2는 forward + backward boundary fallback만 갖는다 (middle row 없음)', () => {
    expect(centralDifferenceMatrix(2)).toEqual([
      [-1, 1],
      [-1, 1],
    ]);
  });

  test('binCount 3은 첫/마지막 row가 one-sided fallback, 가운데 row가 central이다', () => {
    expect(centralDifferenceMatrix(3)).toEqual([
      [-1, 1, 0],
      [-0.5, 0, 0.5],
      [0, -1, 1],
    ]);
  });

  test('binCount 5는 양쪽 boundary가 one-sided, 내부 row가 central [-0.5, 0, 0.5]이다', () => {
    expect(centralDifferenceMatrix(5)).toEqual([
      [-1, 1, 0, 0, 0],
      [-0.5, 0, 0.5, 0, 0],
      [0, -0.5, 0, 0.5, 0],
      [0, 0, -0.5, 0, 0.5],
      [0, 0, 0, -1, 1],
    ]);
  });

  test.each(INVALID_BIN_COUNTS)('invalid binCount %s는 RangeError', (binCount) => {
    expect(() => centralDifferenceMatrix(binCount)).toThrow(RangeError);
  });
});

describe('centralDifferenceMatrixInto — unit-grid central 차분 행렬 (Into)', () => {
  test('out을 반환한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    const result = centralDifferenceMatrixInto(out, 2);
    expect(result).toBe(out);
  });

  test('성공 시 기존 out을 target shape로 truncate한다', () => {
    const out: number[][] = [
      [9, 9, 9, 9],
      [9, 9, 9, 9],
      [9, 9, 9, 9],
      [9, 9, 9, 9],
    ];
    centralDifferenceMatrixInto(out, 3);
    expect(out).toEqual([
      [-1, 1, 0],
      [-0.5, 0, 0.5],
      [0, -1, 1],
    ]);
    expect(out.length).toBe(3);
    for (const row of out) {
      expect(row.length).toBe(3);
    }
  });

  test('binCount 0은 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9], [9]];
    centralDifferenceMatrixInto(out, 0);
    expect(out).toEqual([]);
  });

  test('binCount 1은 [[0]]을 기록한다', () => {
    const out: number[][] = [[9]];
    centralDifferenceMatrixInto(out, 1);
    expect(out).toEqual([[0]]);
  });

  test('binCount 5는 양쪽 boundary fallback과 내부 central row를 기록한다', () => {
    const out: number[][] = Array.from({ length: 5 }, () => new Array<number>(5).fill(9));
    centralDifferenceMatrixInto(out, 5);
    expect(out).toEqual([
      [-1, 1, 0, 0, 0],
      [-0.5, 0, 0.5, 0, 0],
      [0, -0.5, 0, 0.5, 0],
      [0, 0, -0.5, 0, 0.5],
      [0, 0, 0, -1, 1],
    ]);
  });

  test.each(INVALID_BIN_COUNTS)('invalid binCount %s는 RangeError이고 out을 수정하지 않는다', (binCount) => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    const snapshot = out.map((row) => row.slice());
    expect(() => centralDifferenceMatrixInto(out, binCount)).toThrow(RangeError);
    expect(out).toEqual(snapshot);
  });

  test('out row 개수가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() => centralDifferenceMatrixInto(out, 2)).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out row가 array가 아니면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const notArray = 'not array' as unknown as number[];
    const out: number[][] = [[9, 9], notArray];
    expect(() => centralDifferenceMatrixInto(out, 2)).toThrow(RangeError);
    expect(out[0]).toEqual([9, 9]);
    expect(out[1]).toBe(notArray);
    expect(out.length).toBe(2);
  });

  test('out row capacity가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9], [9]];
    expect(() => centralDifferenceMatrixInto(out, 2)).toThrow(RangeError);
    expect(out).toEqual([[9, 9], [9]]);
  });
});
