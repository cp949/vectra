/**
 * linalg matrix element-wise combine unit test.
 *
 * combineMatrices(Into) — callback에 (a, b, r, c) 전달, callback throw atomicity,
 *                         callback non-finite return reject, shape mismatch reject,
 *                         a non-finite entry reject, out capacity 부족 + 원자성,
 *                         out === a aliasing 허용, empty matrix는 callback 미호출.
 */

import { describe, expect, test, vi } from 'vitest';
import { combineMatrices } from '../../../src/linalg/combine-matrices';
import { combineMatricesInto } from '../../../src/linalg/combine-matrices-into';

// ---------------------------------------------------------------------------
// combineMatricesInto / combineMatrices
// ---------------------------------------------------------------------------

describe('combineMatricesInto — callback 기반 element-wise 합성 (Into)', () => {
  test('callback에 (a, b, row, column)을 전달하고 결과를 기록한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
    ];
    const recorded: Array<readonly [number, number, number, number]> = [];
    combineMatricesInto(
      out,
      [
        [1, 2, 3],
        [4, 5, 6],
      ],
      [
        [10, 20, 30],
        [40, 50, 60],
      ],
      (av, bv, r, c) => {
        recorded.push([av, bv, r, c]);
        return av - bv;
      }
    );
    expect(out).toEqual([
      [-9, -18, -27],
      [-36, -45, -54],
    ]);
    expect(recorded).toEqual([
      [1, 10, 0, 0],
      [2, 20, 0, 1],
      [3, 30, 0, 2],
      [4, 40, 1, 0],
      [5, 50, 1, 1],
      [6, 60, 1, 2],
    ]);
  });

  test('빈 matrix는 callback을 호출하지 않고 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9]];
    const fn = vi.fn(() => 1);
    combineMatricesInto(out, [], [], fn);
    expect(out).toEqual([]);
    expect(fn).not.toHaveBeenCalled();
  });

  test('shape mismatch는 RangeError를 던지고 callback을 호출하지 않으며 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    const fn = vi.fn(() => 0);
    expect(() => combineMatricesInto(out, [[1, 2]], [[1, 2, 3]], fn)).toThrow(RangeError);
    expect(fn).not.toHaveBeenCalled();
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('callback이 throw하면 예외를 전파하고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      combineMatricesInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
        (_a, _b, r, c) => {
          if (r === 1 && c === 1) {
            throw new Error('callback failure');
          }
          return 0;
        }
      )
    ).toThrow('callback failure');
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('callback이 non-finite %s를 반환하면 RangeError를 던지고 out을 수정하지 않는다', (bad) => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      combineMatricesInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
        () => bad
      )
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('out === a aliasing이 허용된다', () => {
    const a: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const b: number[][] = [
      [10, 10],
      [10, 10],
    ];
    combineMatricesInto(a, a, b, (av, bv) => av + bv);
    expect(a).toEqual([
      [11, 12],
      [13, 14],
    ]);
  });

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() =>
      combineMatricesInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
        (av, bv) => av + bv
      )
    ).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('a의 non-finite entry는 RangeError', () => {
    const out: number[][] = [[9]];
    expect(() => combineMatricesInto(out, [[Number.NaN]], [[0]], (av, bv) => av + bv)).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });
});

describe('combineMatrices — callback 기반 element-wise 합성 (companion)', () => {
  test('새 number[][] 배열을 반환한다', () => {
    expect(
      combineMatrices(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [10, 20],
          [30, 40],
        ],
        (av, bv) => av * bv
      )
    ).toEqual([
      [10, 40],
      [90, 160],
    ]);
  });

  test('빈 matrix는 callback을 호출하지 않고 빈 배열을 반환한다', () => {
    const fn = vi.fn(() => 1);
    expect(combineMatrices([], [], fn)).toEqual([]);
    expect(fn).not.toHaveBeenCalled();
  });

  test('callback throw는 그대로 전파한다', () => {
    expect(() =>
      combineMatrices([[1]], [[1]], () => {
        throw new Error('boom');
      })
    ).toThrow('boom');
  });

  test('callback non-finite 반환은 RangeError', () => {
    expect(() => combineMatrices([[1]], [[1]], () => Number.NaN)).toThrow(RangeError);
  });

  test('shape mismatch는 RangeError', () => {
    expect(() => combineMatrices([[1]], [[1, 2]], (av, bv) => av + bv)).toThrow(RangeError);
  });
});
