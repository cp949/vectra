/**
 * linalg row echelon form unit test.
 *
 * rowEchelonForm(Into) — rectangular wide/tall, zero column skip, row swap 케이스, singular matrix,
 *                        -0 cleanup, overflow reject, aliasing 허용.
 * 공통                 — invalid epsilon(음수/NaN/Infinity), output capacity 부족, 빈 matrix.
 */

import { describe, expect, test } from 'vitest';
import { rowEchelonForm } from '../../../src/linalg/row-echelon-form';
import { rowEchelonFormInto } from '../../../src/linalg/row-echelon-form-into';

describe('rowEchelonFormInto — REF (Into)', () => {
  test('3x3 nonsingular matrix에서 upper triangular 결과를 반환한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    rowEchelonFormInto(out, [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10],
    ]);
    // Partial pivoting: row 2 (|7|) up, then row 1 (|4/7*8 - 5| 적은 쪽), etc.
    // pivot 값은 normalize되지 않으므로 결과 확인은 upper triangular & rank=3.
    expect(out).toHaveLength(3);
    expect(out[1][0]).toBe(0);
    expect(out[2][0]).toBe(0);
    expect(out[2][1]).toBe(0);
    // top pivot은 7 (max abs of column 0).
    expect(out[0][0]).toBe(7);
  });

  test('rectangular wide matrix (rows < columns)도 처리한다', () => {
    const out: number[][] = [
      [9, 9, 9, 9],
      [9, 9, 9, 9],
    ];
    rowEchelonFormInto(out, [
      [1, 2, 3, 4],
      [2, 4, 6, 8],
    ]);
    // row 2 = 2 * row 1, singular. pivot row 0 = larger abs = either; partial pivoting picks first if tied.
    // After elimination, row 1 becomes all zero.
    expect(out[1]).toEqual([0, 0, 0, 0]);
  });

  test('rectangular tall matrix (rows > columns)도 처리한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
      [9, 9],
    ];
    rowEchelonFormInto(out, [
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
    // 3 rows, 2 columns. rank at most 2. row 2 (last) should be all zero after REF.
    expect(out[2]).toEqual([0, 0]);
    expect(out[1][0]).toBe(0);
  });

  test('all-zero column이 있어도 다음 column으로 진행한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
    ];
    rowEchelonFormInto(out, [
      [0, 1, 2],
      [0, 3, 4],
    ]);
    // column 0 all zero → skip. pivot column 1. row 1 (|3|) up, then eliminate row 1's column 1.
    expect(out[0][0]).toBe(0);
    expect(out[1][0]).toBe(0);
    expect(out[1][1]).toBe(0);
  });

  test('singular matrix는 zero row를 만든다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    rowEchelonFormInto(out, [
      [1, 2],
      [2, 4],
    ]);
    // row 2 = 2 * row 1 → singular.
    expect(out[1]).toEqual([0, 0]);
  });

  test('빈 matrix는 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9], [9]];
    rowEchelonFormInto(out, []);
    expect(out).toEqual([]);
  });

  test('-0이 결과에 남지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    rowEchelonFormInto(out, [
      [-1, 2],
      [2, -4],
    ]);
    // row 2 = -2 * row 1 → singular. After elimination row 1 should be zero with no -0.
    expect(out[1]).toEqual([0, 0]);
    expect(Object.is(out[1][0], -0)).toBe(false);
    expect(Object.is(out[1][1], -0)).toBe(false);
  });

  test('overflow 결과는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    // pivot 후 row[1][1] = MAX_VALUE - (-1) * MAX_VALUE = 2 * MAX_VALUE = Infinity.
    expect(() =>
      rowEchelonFormInto(out, [
        [1, Number.MAX_VALUE],
        [-1, Number.MAX_VALUE],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    -1,
  ])('invalid epsilon %s는 RangeError를 던지고 out을 수정하지 않는다', (bad) => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      rowEchelonFormInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        { epsilon: bad }
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
      rowEchelonFormInto(out, [
        [1, 2],
        [3, 4],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('out === matrix aliasing이 허용된다', () => {
    const m: number[][] = [
      [1, 2],
      [3, 4],
    ];
    rowEchelonFormInto(m, m);
    expect(m[1][0]).toBe(0);
    expect(m[0][0]).toBe(3);
  });
});

describe('rowEchelonForm — REF (companion)', () => {
  test('새 number[][]을 반환하고 input row 참조를 공유하지 않는다', () => {
    const m: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const result = rowEchelonForm(m);
    m[0][0] = 999;
    m[1][0] = 999;
    expect(result[1][0]).toBe(0);
    expect(result[0][0]).toBe(3);
  });

  test('빈 matrix는 빈 배열을 반환한다', () => {
    expect(rowEchelonForm([])).toEqual([]);
  });
});
