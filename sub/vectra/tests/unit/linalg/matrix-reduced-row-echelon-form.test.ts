/**
 * linalg reduced row echelon form unit test.
 *
 * reducedRowEchelonForm(Into) — pivot normalize, above/below elimination, custom epsilon cleanup,
 *                               identity 결과, aliasing 허용.
 * 공통                        — invalid epsilon(음수/NaN/Infinity), output capacity 부족, 빈 matrix.
 */

import { describe, expect, test } from 'vitest';
import { reducedRowEchelonForm } from '../../../src/linalg/reduced-row-echelon-form';
import { reducedRowEchelonFormInto } from '../../../src/linalg/reduced-row-echelon-form-into';

describe('reducedRowEchelonFormInto — RREF (Into)', () => {
  test('nonsingular matrix는 identity로 reduce된다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    reducedRowEchelonFormInto(out, [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10],
    ]);
    expect(out).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  test('singular matrix는 row reduction 후 zero row를 남긴다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    reducedRowEchelonFormInto(out, [
      [1, 2],
      [2, 4],
    ]);
    // pivot row normalize, no rank-2 pivot.
    // 기대: [[1, 2], [0, 0]] (pivot은 row 1을 위로 swap한 뒤 normalize).
    expect(out[0][0]).toBe(1);
    expect(out[1]).toEqual([0, 0]);
  });

  test('rectangular wide matrix에서도 RREF를 만든다', () => {
    const out: number[][] = [
      [9, 9, 9, 9],
      [9, 9, 9, 9],
    ];
    reducedRowEchelonFormInto(out, [
      [1, 0, 2, 3],
      [0, 1, 4, 5],
    ]);
    // 이미 RREF 형태. partial pivot은 column 0 max = row 0, column 1 max = row 1, swap 없음.
    expect(out).toEqual([
      [1, 0, 2, 3],
      [0, 1, 4, 5],
    ]);
  });

  test('rectangular tall matrix에서도 RREF를 만든다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
      [9, 9],
    ];
    reducedRowEchelonFormInto(out, [
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
    // rank = 2 (3 rows, 2 cols). 마지막 row는 zero row.
    expect(out[2]).toEqual([0, 0]);
    // 상단 2x2는 identity.
    expect(out[0]).toEqual([1, 0]);
    expect(out[1]).toEqual([0, 1]);
  });

  test('all-zero column이 있을 때 column을 skip한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
    ];
    reducedRowEchelonFormInto(out, [
      [0, 1, 2],
      [0, 3, 4],
    ]);
    // column 0 skip. column 1 pivot row 1 (|3|) up, normalize. eliminate row 0's column 1.
    // 결과: [[0, 1, ?], [0, 0, ?]] 형태.
    expect(out[0][0]).toBe(0);
    expect(out[0][1]).toBe(1);
    expect(out[1][0]).toBe(0);
    expect(out[1][1]).toBe(0);
  });

  test('이미 identity인 입력은 그대로 반환한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    reducedRowEchelonFormInto(out, [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
    expect(out).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  test('-0이 결과에 남지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    reducedRowEchelonFormInto(out, [
      [-2, 4],
      [1, -2],
    ]);
    // singular: row 2 = -1/2 * row 1. RREF 결과 [[1, -2], [0, 0]]
    expect(out[1]).toEqual([0, 0]);
    expect(Object.is(out[1][0], -0)).toBe(false);
    expect(Object.is(out[1][1], -0)).toBe(false);
  });

  test('빈 matrix는 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9], [9]];
    reducedRowEchelonFormInto(out, []);
    expect(out).toEqual([]);
  });

  test('out === matrix aliasing이 허용된다', () => {
    const m: number[][] = [
      [1, 2],
      [3, 4],
    ];
    reducedRowEchelonFormInto(m, m);
    expect(m).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() =>
      reducedRowEchelonFormInto(out, [
        [1, 2],
        [3, 4],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    -0.5,
  ])('invalid epsilon %s는 RangeError를 던지고 out을 수정하지 않는다', (bad) => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      reducedRowEchelonFormInto(
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

  test('overflow 결과는 RangeError', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    // normalize 후 factor=row[1][0]=-1, pivot row[0][1]=MAX_VALUE → row[1][1] - (-1)*MAX_VALUE = 2*MAX_VALUE.
    expect(() =>
      reducedRowEchelonFormInto(out, [
        [1, Number.MAX_VALUE],
        [-1, Number.MAX_VALUE],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });
});

describe('reducedRowEchelonForm — RREF (companion)', () => {
  test('nonsingular matrix에서 identity를 반환한다', () => {
    expect(
      reducedRowEchelonForm([
        [2, 0],
        [0, 3],
      ])
    ).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });

  test('input row 참조를 공유하지 않는다', () => {
    const m: number[][] = [
      [1, 0],
      [0, 1],
    ];
    const result = reducedRowEchelonForm(m);
    m[0][0] = 999;
    expect(result[0][0]).toBe(1);
  });

  test('빈 matrix는 빈 배열', () => {
    expect(reducedRowEchelonForm([])).toEqual([]);
  });

  test('invalid epsilon은 RangeError', () => {
    expect(() => reducedRowEchelonForm([[1]], { epsilon: Number.NaN })).toThrow(RangeError);
  });
});
