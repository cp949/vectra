/**
 * linalg pivot unit test.
 *
 * pivot(Into)                       — largest absolute pivot row 선택, no swap, all-zero
 *                                     column skip, custom epsilon, aliasing 허용, invalid epsilon.
 * 공통                              — invalid epsilon(음수/NaN/Infinity), output capacity 부족, 빈 matrix.
 */

import { describe, expect, test } from 'vitest';
import { pivot } from '../../../src/linalg/pivot';
import { pivotInto } from '../../../src/linalg/pivot-into';

describe('pivotInto — partial pivoting row reorder (Into)', () => {
  test('각 diagonal에서 절대값 최대 row를 위로 올린다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    const result = pivotInto(out, [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    expect(result).toBe(out);
    // diagonal 0: column 0의 max abs는 row 2 (|7|). swap (0, 2).
    // diagonal 1: column 1의 max abs는 row 1 (|5|). no swap.
    // diagonal 2: column 2의 max abs는 row 2 (|3|). no swap.
    expect(out).toEqual([
      [7, 8, 9],
      [4, 5, 6],
      [1, 2, 3],
    ]);
  });

  test('이미 최적이면 swap하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    pivotInto(out, [
      [10, 1],
      [1, 5],
    ]);
    expect(out).toEqual([
      [10, 1],
      [1, 5],
    ]);
  });

  test('all-zero first column은 swap을 건너뛰고 다음 diagonal로 이동한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    pivotInto(out, [
      [0, 1, 2],
      [0, 3, 4],
      [0, 5, 6],
    ]);
    // column 0 all zero → no swap at diagonal 0.
    // column 1, rows >= 1: |3|, |5| → max row 2. swap rows 1, 2.
    expect(out).toEqual([
      [0, 1, 2],
      [0, 5, 6],
      [0, 3, 4],
    ]);
  });

  test('rectangular tall matrix (rows > columns)에서 column 수만큼 diagonal을 본다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
      [9, 9],
    ];
    pivotInto(out, [
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
    // diagonal 0: column 0 max = row 2 (|5|). swap (0, 2).
    // diagonal 1: column 1, rows >= 1. row1=4, row2=2 → max row 1. no swap.
    expect(out).toEqual([
      [5, 6],
      [3, 4],
      [1, 2],
    ]);
  });

  test('rectangular wide matrix (rows < columns)에서 row 수만큼 diagonal을 본다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
    ];
    pivotInto(out, [
      [1, 2, 3],
      [10, 5, 6],
    ]);
    // diagonal 0: column 0 max = row 1 (|10|). swap (0, 1).
    // diagonal 1: column 1, rows >= 1 = row 1. only row, no swap.
    expect(out).toEqual([
      [10, 5, 6],
      [1, 2, 3],
    ]);
  });

  test('빈 matrix는 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9], [9]];
    pivotInto(out, []);
    expect(out).toEqual([]);
  });

  test('custom epsilon으로 작은 pivot 후보를 zero로 본다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    // 첫 column이 모두 1e-12로 epsilon(1e-9) 이하 → diagonal 0 swap 안 함.
    // column 1, rows >= 1: row 1 = 5 → no swap (이미 row 1).
    pivotInto(
      out,
      [
        [1e-12, 1],
        [1e-12, 5],
      ],
      { epsilon: 1e-9 }
    );
    expect(out).toEqual([
      [1e-12, 1],
      [1e-12, 5],
    ]);
  });

  test('epsilon = 0이면 작은 값도 후보로 본다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    pivotInto(
      out,
      [
        [1e-12, 1],
        [1, 5],
      ],
      { epsilon: 0 }
    );
    // diagonal 0: column 0 max = row 1 (|1|). swap rows 0, 1.
    expect(out).toEqual([
      [1, 5],
      [1e-12, 1],
    ]);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -1])(
    'invalid epsilon %s는 RangeError를 던지고 out을 수정하지 않는다',
    (bad) => {
      const out: number[][] = [
        [9, 9],
        [9, 9],
      ];
      expect(() =>
        pivotInto(
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
    }
  );

  test('non-finite entry는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() => pivotInto(out, [[Number.NaN, 1]])).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() =>
      pivotInto(out, [
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
    pivotInto(m, m);
    // diagonal 0: max row 1 (|3|). swap.
    expect(m).toEqual([
      [3, 4],
      [1, 2],
    ]);
  });
});

describe('pivot — partial pivoting row reorder (companion)', () => {
  test('새 number[][]을 반환하고 input row 참조를 공유하지 않는다', () => {
    const m: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const result = pivot(m);
    m[0][0] = 999;
    m[1][0] = 999;
    expect(result).toEqual([
      [3, 4],
      [1, 2],
    ]);
  });

  test('빈 matrix는 빈 배열을 반환한다', () => {
    expect(pivot([])).toEqual([]);
  });

  test('invalid epsilon은 RangeError', () => {
    expect(() => pivot([[1]], { epsilon: -1 })).toThrow(RangeError);
  });
});
