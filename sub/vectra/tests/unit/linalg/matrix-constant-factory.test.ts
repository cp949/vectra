/**
 * linalg constant/basic matrix factory unit test.
 */

import { describe, expect, test } from 'vitest';
import { fill } from '../../../src/linalg/fill';
import { fillInto } from '../../../src/linalg/fill-into';
import { identity } from '../../../src/linalg/identity';
import { identityInto } from '../../../src/linalg/identity-into';
import { ones } from '../../../src/linalg/ones';
import { onesInto } from '../../../src/linalg/ones-into';
import { zeros } from '../../../src/linalg/zeros';
import { zerosInto } from '../../../src/linalg/zeros-into';

// ---------------------------------------------------------------------------
// zerosInto / zeros
// ---------------------------------------------------------------------------

describe('zerosInto — zero matrix 생성 (Into)', () => {
  test('정상 shape에서 모든 entry를 0으로 채우고 out을 반환한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
    ];
    const result = zerosInto(out, [2, 3]);
    expect(result).toBe(out);
    expect(out).toEqual([
      [0, 0, 0],
      [0, 0, 0],
    ]);
  });

  test('out row 또는 row capacity가 더 크면 target shape로 truncate한다', () => {
    const out: number[][] = [
      [9, 9, 9, 9],
      [9, 9, 9, 9],
      [9, 9, 9, 9],
    ];
    zerosInto(out, [2, 2]);
    expect(out).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  test('[0, 0] shape는 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9], [9]];
    zerosInto(out, [0, 0]);
    expect(out).toEqual([]);
  });

  test.each([
    [-1, 1] as const,
    [1, -1] as const,
    [0.5, 1] as const,
    [1, 0.5] as const,
    [Number.NaN, 1] as const,
    [1, Number.POSITIVE_INFINITY] as const,
    [Number.MAX_SAFE_INTEGER + 1, 1] as const,
  ])('비정수/음수/unsafe shape [%s, %s]는 RangeError', (rows, columns) => {
    const out: number[][] = [];
    expect(() => zerosInto(out, [rows, columns])).toThrow(RangeError);
  });

  test('one-sided zero shape [2, 0] / [0, 2]는 RangeError', () => {
    const out: number[][] = [];
    expect(() => zerosInto(out, [2, 0])).toThrow(RangeError);
    expect(() => zerosInto(out, [0, 2])).toThrow(RangeError);
  });

  test('out row 개수가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() => zerosInto(out, [2, 2])).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out row capacity가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9], [9]];
    expect(() => zerosInto(out, [2, 2])).toThrow(RangeError);
    expect(out).toEqual([[9], [9]]);
  });
});

describe('zeros — zero matrix 생성 (companion)', () => {
  test('새 number[][] 배열을 반환한다', () => {
    expect(zeros([2, 3])).toEqual([
      [0, 0, 0],
      [0, 0, 0],
    ]);
  });

  test('[0, 0]은 빈 배열을 반환한다', () => {
    expect(zeros([0, 0])).toEqual([]);
  });

  test('one-sided zero shape는 RangeError', () => {
    expect(() => zeros([2, 0])).toThrow(RangeError);
    expect(() => zeros([0, 2])).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// onesInto / ones
// ---------------------------------------------------------------------------

describe('onesInto — one matrix 생성 (Into)', () => {
  test('정상 shape에서 모든 entry를 1로 채운다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    onesInto(out, [2, 2]);
    expect(out).toEqual([
      [1, 1],
      [1, 1],
    ]);
  });

  test('[0, 0] shape는 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9], [9]];
    onesInto(out, [0, 0]);
    expect(out).toEqual([]);
  });

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => onesInto(out, [2, 2])).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });
});

describe('ones — one matrix 생성 (companion)', () => {
  test('새 number[][] 배열을 반환한다', () => {
    expect(ones([1, 3])).toEqual([[1, 1, 1]]);
  });

  test('[0, 0]은 빈 배열을 반환한다', () => {
    expect(ones([0, 0])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// identityInto / identity
// ---------------------------------------------------------------------------

describe('identityInto — identity matrix 생성 (Into)', () => {
  test('size 3 identity matrix를 기록한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    identityInto(out, 3);
    expect(out).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  test('size 1 identity는 [[1]]', () => {
    const out: number[][] = [[9]];
    identityInto(out, 1);
    expect(out).toEqual([[1]]);
  });

  test('size 0은 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9]];
    identityInto(out, 0);
    expect(out).toEqual([]);
  });

  test.each([-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    '비정수/음수/unsafe size %s는 RangeError',
    (size) => {
      const out: number[][] = [];
      expect(() => identityInto(out, size)).toThrow(RangeError);
    }
  );

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() => identityInto(out, 3)).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });
});

describe('identity — identity matrix 생성 (companion)', () => {
  test('size 3 identity matrix를 반환한다', () => {
    expect(identity(3)).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  test('size 0은 빈 배열을 반환한다', () => {
    expect(identity(0)).toEqual([]);
  });

  test('비정수 size는 RangeError', () => {
    expect(() => identity(1.5)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// fillInto / fill
// ---------------------------------------------------------------------------

describe('fillInto — value matrix 생성 (Into)', () => {
  test('정상 shape에서 모든 entry를 value로 채운다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
    ];
    fillInto(out, [2, 3], 7);
    expect(out).toEqual([
      [7, 7, 7],
      [7, 7, 7],
    ]);
  });

  test('[0, 0] shape는 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9]];
    fillInto(out, [0, 0], 1);
    expect(out).toEqual([]);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'non-finite value %s는 RangeError를 던지고 out을 수정하지 않는다',
    (value) => {
      const out: number[][] = [
        [9, 9],
        [9, 9],
      ];
      expect(() => fillInto(out, [2, 2], value)).toThrow(RangeError);
      expect(out).toEqual([
        [9, 9],
        [9, 9],
      ]);
    }
  );

  test('one-sided zero shape는 RangeError', () => {
    const out: number[][] = [];
    expect(() => fillInto(out, [2, 0], 1)).toThrow(RangeError);
    expect(() => fillInto(out, [0, 2], 1)).toThrow(RangeError);
  });

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => fillInto(out, [2, 2], 7)).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });
});

describe('fill — value matrix 생성 (companion)', () => {
  test('새 number[][] 배열을 반환한다', () => {
    expect(fill([2, 2], 3)).toEqual([
      [3, 3],
      [3, 3],
    ]);
  });

  test('[0, 0]은 빈 배열을 반환한다', () => {
    expect(fill([0, 0], 1)).toEqual([]);
  });

  test('non-finite value는 RangeError', () => {
    expect(() => fill([1, 1], Number.NaN)).toThrow(RangeError);
  });
});
