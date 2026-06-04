/**
 * addScalarMultipleOfRowToRow / addScalarMultipleOfRowToRowInto unit test.
 *
 * addScalarMultipleOfRowToRowInto — scalar 적용, zero scalar, self-add, non-finite scalar,
 *                                   scaling overflow, 합 overflow, invalid rowIndex, aliasing 허용.
 * addScalarMultipleOfRowToRow     — 새 matrix 반환, non-finite scalar, deep copy.
 */

import { describe, expect, test } from 'vitest';
import { addScalarMultipleOfRowToRow } from '../../../src/linalg/add-scalar-multiple-of-row-to-row';
import { addScalarMultipleOfRowToRowInto } from '../../../src/linalg/add-scalar-multiple-of-row-to-row-into';

describe('addScalarMultipleOfRowToRowInto — matrix row += scalar * otherRow (Into)', () => {
  test('targetRow += scalar * rowToAdd를 적용한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
    ];
    addScalarMultipleOfRowToRowInto(
      out,
      [
        [1, 2, 3],
        [10, 20, 30],
      ],
      0,
      1,
      -0.5
    );
    expect(out).toEqual([
      [-4, -8, -12],
      [10, 20, 30],
    ]);
  });

  test('scalar = 0은 targetRow를 그대로 유지한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    addScalarMultipleOfRowToRowInto(
      out,
      [
        [1, 2],
        [3, 4],
      ],
      0,
      1,
      0
    );
    expect(out).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test('targetRow === rowToAdd 는 (1 + scalar)배가 된다', () => {
    const out: number[][] = [[9, 9]];
    addScalarMultipleOfRowToRowInto(out, [[2, 4]], 0, 0, 3);
    expect(out).toEqual([[8, 16]]);
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
      addScalarMultipleOfRowToRowInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        0,
        1,
        bad
      )
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('scaling overflow(Number.MAX_VALUE * 2)는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9], [9]];
    expect(() => addScalarMultipleOfRowToRowInto(out, [[0], [Number.MAX_VALUE]], 0, 1, 2)).toThrow(RangeError);
    expect(out).toEqual([[9], [9]]);
  });

  test('합 overflow는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9], [9]];
    expect(() => addScalarMultipleOfRowToRowInto(out, [[Number.MAX_VALUE], [Number.MAX_VALUE]], 0, 1, 1)).toThrow(
      RangeError
    );
    expect(out).toEqual([[9], [9]]);
  });

  test('invalid rowIndex는 RangeError', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      addScalarMultipleOfRowToRowInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        0,
        2,
        1
      )
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('out === matrix aliasing이 허용된다', () => {
    const m: number[][] = [
      [1, 2],
      [10, 20],
    ];
    addScalarMultipleOfRowToRowInto(m, m, 0, 1, 2);
    expect(m).toEqual([
      [21, 42],
      [10, 20],
    ]);
  });
});

describe('addScalarMultipleOfRowToRow — matrix row += scalar * otherRow (companion)', () => {
  test('새 number[][]을 반환한다', () => {
    expect(
      addScalarMultipleOfRowToRow(
        [
          [1, 2],
          [3, 4],
        ],
        0,
        1,
        -1
      )
    ).toEqual([
      [-2, -2],
      [3, 4],
    ]);
  });

  test('non-finite scalar는 RangeError', () => {
    expect(() => addScalarMultipleOfRowToRow([[1]], 0, 0, Number.NaN)).toThrow(RangeError);
  });

  test('input row 참조를 공유하지 않는다', () => {
    const m: number[][] = [
      [1, 2],
      [10, 20],
    ];
    const result = addScalarMultipleOfRowToRow(m, 0, 1, 1);
    m[0][0] = 999;
    m[1][0] = 999;
    expect(result).toEqual([
      [11, 22],
      [10, 20],
    ]);
  });
});
