/**
 * addRowToRow / addRowToRowInto unit test.
 *
 * addRowToRowInto — target/source 동일(self double), overflow, capacity 부족,
 *                   invalid targetRow, invalid rowToAdd, aliasing 허용.
 * addRowToRow     — 새 matrix 반환, deep copy, invalid index, overflow.
 */

import { describe, expect, test } from 'vitest';
import { addRowToRow } from '../../../src/linalg/add-row-to-row';
import { addRowToRowInto } from '../../../src/linalg/add-row-to-row-into';

describe('addRowToRowInto — matrix row += otherRow (Into)', () => {
  test('targetRow에 rowToAdd를 더하고 나머지 row는 그대로 복사한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    addRowToRowInto(
      out,
      [
        [1, 2, 3],
        [10, 20, 30],
        [100, 200, 300],
      ],
      0,
      2
    );
    expect(out).toEqual([
      [101, 202, 303],
      [10, 20, 30],
      [100, 200, 300],
    ]);
  });

  test('targetRow === rowToAdd는 해당 row를 2배로 만든다', () => {
    const out: number[][] = [[9, 9]];
    addRowToRowInto(out, [[1, 2]], 0, 0);
    expect(out).toEqual([[2, 4]]);
  });

  test('합 overflow(Number.MAX_VALUE + Number.MAX_VALUE)는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9], [9]];
    expect(() => addRowToRowInto(out, [[Number.MAX_VALUE], [Number.MAX_VALUE]], 0, 1)).toThrow(RangeError);
    expect(out).toEqual([[9], [9]]);
  });

  test.each([-1, 0.5, 2, Number.NaN, Number.POSITIVE_INFINITY])('invalid targetRow %s는 RangeError', (bad) => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      addRowToRowInto(
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
  });

  test.each([-1, 0.5, 2, Number.NaN, Number.POSITIVE_INFINITY])('invalid rowToAdd %s는 RangeError', (bad) => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      addRowToRowInto(
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

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() =>
      addRowToRowInto(
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

  test('out === matrix aliasing이 허용된다', () => {
    const m: number[][] = [
      [1, 2],
      [10, 20],
    ];
    addRowToRowInto(m, m, 0, 1);
    expect(m).toEqual([
      [11, 22],
      [10, 20],
    ]);
  });
});

describe('addRowToRow — matrix row += otherRow (companion)', () => {
  test('새 number[][]을 반환하고 input을 deep copy한다', () => {
    const m: number[][] = [
      [1, 2],
      [10, 20],
    ];
    const result = addRowToRow(m, 0, 1);
    m[0][0] = 999;
    m[1][0] = 999;
    expect(result).toEqual([
      [11, 22],
      [10, 20],
    ]);
  });

  test('invalid index는 RangeError', () => {
    expect(() => addRowToRow([[1]], 1, 0)).toThrow(RangeError);
  });

  test('overflow는 RangeError', () => {
    expect(() => addRowToRow([[Number.MAX_VALUE], [Number.MAX_VALUE]], 0, 1)).toThrow(RangeError);
  });
});
