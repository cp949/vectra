/**
 * exchangeRows / exchangeRowsInto unit test.
 *
 * exchangeRowsInto — two-row swap, same row no-op, invalid first, invalid second,
 *                    capacity 부족, aliasing 허용, non-finite entry.
 * exchangeRows     — 새 matrix 반환, deep copy, same row no-op, invalid index.
 */

import { describe, expect, test } from 'vitest';
import { exchangeRows } from '../../../src/linalg/exchange-rows';
import { exchangeRowsInto } from '../../../src/linalg/exchange-rows-into';

describe('exchangeRowsInto — matrix row swap (Into)', () => {
  test('두 row를 교환하고 나머지 row는 그대로 복사한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    exchangeRowsInto(
      out,
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
      0,
      2
    );
    expect(out).toEqual([
      [7, 8, 9],
      [4, 5, 6],
      [1, 2, 3],
    ]);
  });

  test('first === second는 no-op로 동작하며 원본을 그대로 복사한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    exchangeRowsInto(
      out,
      [
        [1, 2],
        [3, 4],
      ],
      1,
      1
    );
    expect(out).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test.each([-1, 0.5, 2, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'invalid first %s는 RangeError를 던지고 out을 수정하지 않는다',
    (bad) => {
      const out: number[][] = [
        [9, 9],
        [9, 9],
      ];
      expect(() =>
        exchangeRowsInto(
          out,
          [
            [1, 2],
            [3, 4],
          ],
          bad,
          0
        )
      ).toThrow(RangeError);
      expect(out).toEqual([
        [9, 9],
        [9, 9],
      ]);
    }
  );

  test.each([-1, 0.5, 2, Number.NaN, Number.POSITIVE_INFINITY])(
    'invalid second %s는 RangeError를 던지고 out을 수정하지 않는다',
    (bad) => {
      const out: number[][] = [
        [9, 9],
        [9, 9],
      ];
      expect(() =>
        exchangeRowsInto(
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
    }
  );

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() =>
      exchangeRowsInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        0,
        1
      )
    ).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('out === matrix aliasing이 허용된다 (temp matrix에서 계산 후 commit)', () => {
    const m: number[][] = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];
    exchangeRowsInto(m, m, 0, 2);
    expect(m).toEqual([
      [5, 6],
      [3, 4],
      [1, 2],
    ]);
  });

  test('non-finite entry는 RangeError', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      exchangeRowsInto(
        out,
        [
          [Number.NaN, 2],
          [3, 4],
        ],
        0,
        1
      )
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });
});

describe('exchangeRows — matrix row swap (companion)', () => {
  test('새 number[][]을 반환하고 input row 참조를 공유하지 않는다', () => {
    const m: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const result = exchangeRows(m, 0, 1);
    m[0][0] = 999;
    m[1][0] = 999;
    expect(result).toEqual([
      [3, 4],
      [1, 2],
    ]);
  });

  test('same row swap은 no-op 결과를 반환한다', () => {
    expect(exchangeRows([[1, 2]], 0, 0)).toEqual([[1, 2]]);
  });

  test('invalid index는 RangeError', () => {
    expect(() => exchangeRows([[1]], 0, 1)).toThrow(RangeError);
  });
});
