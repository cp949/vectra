/**
 * statistics.correlationMatrixInto / correlationMatrix matrix helper를 검증한다.
 * orientation, zero variance, no-variable 경계, validation, symmetric/diagonal, failure atomicity, aliasing, companion을 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { correlationMatrix } from '../../../src/statistics/correlation-matrix';
import { correlationMatrixInto } from '../../../src/statistics/correlation-matrix-into';

describe('correlationMatrixInto — default "columns" orientation', () => {
  test('diagonal은 1', () => {
    const out = correlationMatrix([
      [1, 2],
      [2, 4],
      [3, 6],
    ]);
    expect(out).toHaveLength(2);
    expect(out[0][0]).toBe(1);
    expect(out[1][1]).toBe(1);
  });

  test('perfect linear는 off-diagonal 1', () => {
    // var0=[1,2,3], var1=[2,4,6]=2*var0
    const out = correlationMatrix([
      [1, 2],
      [2, 4],
      [3, 6],
    ]);
    expect(out[0][1]).toBe(1);
    expect(out[1][0]).toBe(1);
  });

  test('perfect negative linear는 off-diagonal -1', () => {
    const out = correlationMatrix([
      [1, 6],
      [2, 4],
      [3, 2],
    ]);
    expect(out[0][1]).toBe(-1);
    expect(out[1][0]).toBe(-1);
  });

  test('fractional correlation', () => {
    // var0=[1,2,3,4], var1=[1,4,9,16]: r = 25 / sqrt(645)
    const out = correlationMatrix([
      [1, 1],
      [2, 4],
      [3, 9],
      [4, 16],
    ]);
    expect(out[0][1]).toBeCloseTo(25 / Math.sqrt(645), 12);
  });
});

describe('correlationMatrixInto — "rows" orientation', () => {
  test('rows orientation에서도 perfect linear는 1', () => {
    const out = correlationMatrix(
      [
        [1, 2, 3],
        [2, 4, 6],
      ],
      { orientation: 'rows' }
    );
    expect(out[0][0]).toBe(1);
    expect(out[1][1]).toBe(1);
    expect(out[0][1]).toBe(1);
    expect(out[1][0]).toBe(1);
  });
});

describe('correlationMatrixInto — zero variance', () => {
  test('상수 variable이 있으면 RangeError', () => {
    expect(() =>
      correlationMatrix([
        [1, 5],
        [2, 5],
        [3, 5],
      ])
    ).toThrow(RangeError);
  });

  test('단일 sample은 모든 variable이 zero variance → RangeError', () => {
    expect(() => correlationMatrix([[3, 5]])).toThrow(RangeError);
  });
});

describe('correlationMatrixInto — no variable', () => {
  test('빈 matrix는 []', () => {
    expect(correlationMatrix([])).toEqual([]);
  });

  test('columns orientation에서 [[], []]는 []', () => {
    expect(correlationMatrix([[], []])).toEqual([]);
  });
});

describe('correlationMatrixInto — invalid input', () => {
  test('non-array data는 TypeError', () => {
    expect(() => correlationMatrixInto([], null as unknown as readonly (readonly number[])[])).toThrow(TypeError);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() => correlationMatrix([[1, 2], [3]])).toThrow(RangeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() =>
      correlationMatrix([
        [1, 2],
        [3, Number.NaN],
      ])
    ).toThrow(RangeError);
  });

  test('invalid orientation은 RangeError', () => {
    expect(() => correlationMatrix([[1]], { orientation: 'bad' as never })).toThrow(RangeError);
  });

  test('invalid mode는 RangeError', () => {
    expect(() => correlationMatrix([[1]], { mode: 'bad' as never })).toThrow(RangeError);
  });
});

describe('correlationMatrixInto — symmetric & diagonal', () => {
  test('결과는 symmetric square matrix', () => {
    const out = correlationMatrix([
      [1, 2, 3],
      [2, 4, 5],
      [3, 6, 7],
      [4, 8, 9],
    ]);
    expect(out).toHaveLength(3);
    for (let r = 0; r < 3; r++) {
      expect(out[r][r]).toBe(1);
      for (let c = r + 1; c < 3; c++) {
        expect(out[r][c]).toBe(out[c][r]);
      }
    }
  });
});

describe('correlationMatrixInto — failure atomicity', () => {
  test('ragged matrix RangeError에서 out 상태 유지', () => {
    const out: number[][] = [[9, 8]];
    expect(() => correlationMatrixInto(out, [[1, 2], [3]])).toThrow(RangeError);
    expect(out).toEqual([[9, 8]]);
  });

  test('zero variance RangeError에서 out 상태 유지', () => {
    const out: number[][] = [
      [7, 7],
      [7, 7],
    ];
    expect(() =>
      correlationMatrixInto(out, [
        [1, 5],
        [2, 5],
        [3, 5],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([
      [7, 7],
      [7, 7],
    ]);
  });

  test('non-finite entry RangeError에서 out 상태 유지', () => {
    const out: number[][] = [[1]];
    expect(() =>
      correlationMatrixInto(out, [
        [1, 2],
        [3, Number.NaN],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([[1]]);
  });
});

describe('correlationMatrixInto — out/data aliasing', () => {
  test('같은 nested array를 out/data로 넘겨도 안전하다', () => {
    const arr: number[][] = [
      [1, 2],
      [2, 4],
      [3, 6],
    ];
    const result = correlationMatrixInto(arr, arr);
    expect(result).toBe(arr);
    expect(arr).toHaveLength(2);
    expect(arr[0][0]).toBe(1);
    expect(arr[0][1]).toBe(1);
    expect(arr[1][0]).toBe(1);
    expect(arr[1][1]).toBe(1);
  });
});

describe('correlationMatrix — companion', () => {
  test('새 matrix를 반환한다', () => {
    const result = correlationMatrix([
      [1, 2],
      [2, 4],
      [3, 6],
    ]);
    expect(result).toHaveLength(2);
    expect(result[0][0]).toBe(1);
    expect(result[0][1]).toBe(1);
  });

  test('빈 입력은 []', () => {
    expect(correlationMatrix([])).toEqual([]);
  });

  test('zero variance는 RangeError', () => {
    expect(() =>
      correlationMatrix([
        [5, 1],
        [5, 2],
      ])
    ).toThrow(RangeError);
  });
});
