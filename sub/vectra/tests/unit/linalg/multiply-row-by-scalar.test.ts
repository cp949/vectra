/**
 * multiplyRowByScalar / multiplyRowByScalarInto unit test.
 *
 * multiplyRowByScalarInto — finite scalar, zero scalar, non-finite scalar, overflow,
 *                           invalid rowIndex, capacity 부족, aliasing 허용, non-finite entry.
 * multiplyRowByScalar     — 새 matrix 반환, deep copy, invalid scalar, invalid rowIndex, overflow.
 */

import { describe, expect, test } from 'vitest';
import { multiplyRowByScalar } from '../../../src/linalg/multiply-row-by-scalar';
import { multiplyRowByScalarInto } from '../../../src/linalg/multiply-row-by-scalar-into';

describe('multiplyRowByScalarInto — matrix row × scalar (Into)', () => {
  test('지정 row만 scalar로 곱하고 나머지 row는 그대로 복사한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    const result = multiplyRowByScalarInto(
      out,
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
      1,
      10
    );
    expect(result).toBe(out);
    expect(out).toEqual([
      [1, 2, 3],
      [40, 50, 60],
      [7, 8, 9],
    ]);
  });

  test('scalar 0은 해당 row를 zero row로 만든다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    multiplyRowByScalarInto(
      out,
      [
        [1, 2],
        [3, 4],
      ],
      0,
      0
    );
    expect(out).toEqual([
      [0, 0],
      [3, 4],
    ]);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('non-finite scalar %s는 RangeError를 던지고 out을 수정하지 않는다', (bad) => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      multiplyRowByScalarInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        0,
        bad
      )
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('overflow(Number.MAX_VALUE * 2 = Infinity)는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => multiplyRowByScalarInto(out, [[Number.MAX_VALUE]], 0, 2)).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test.each([
    -1,
    0.5,
    1.5,
    2,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('invalid rowIndex %s는 RangeError를 던지고 out을 수정하지 않는다', (bad) => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      multiplyRowByScalarInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        bad,
        2
      )
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() =>
      multiplyRowByScalarInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        0,
        2
      )
    ).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('out === matrix aliasing이 허용된다 (temp matrix에서 계산 후 commit)', () => {
    const m: number[][] = [
      [1, 2],
      [3, 4],
    ];
    multiplyRowByScalarInto(m, m, 1, 10);
    expect(m).toEqual([
      [1, 2],
      [30, 40],
    ]);
  });

  test('non-finite entry는 RangeError', () => {
    const out: number[][] = [[9]];
    expect(() => multiplyRowByScalarInto(out, [[Number.NaN]], 0, 2)).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });
});

describe('multiplyRowByScalar — matrix row × scalar (companion)', () => {
  test('새 number[][]을 반환한다', () => {
    expect(
      multiplyRowByScalar(
        [
          [1, 2],
          [3, 4],
        ],
        1,
        3
      )
    ).toEqual([
      [1, 2],
      [9, 12],
    ]);
  });

  test('input row 참조를 공유하지 않는다', () => {
    const m: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const result = multiplyRowByScalar(m, 0, 5);
    m[0][0] = 999;
    expect(result[0]).toEqual([5, 10]);
  });

  test('invalid scalar는 RangeError', () => {
    expect(() => multiplyRowByScalar([[1]], 0, Number.NaN)).toThrow(RangeError);
  });

  test('invalid rowIndex는 RangeError', () => {
    expect(() => multiplyRowByScalar([[1]], 1.5, 2)).toThrow(RangeError);
  });

  test('overflow는 RangeError', () => {
    expect(() => multiplyRowByScalar([[Number.MAX_VALUE]], 0, 2)).toThrow(RangeError);
  });
});
