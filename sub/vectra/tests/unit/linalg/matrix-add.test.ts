/**
 * linalg matrix element-wise add unit test.
 *
 * addMatrices(Into) — same-shape add, shape mismatch reject, empty matrix,
 *                     non-finite input reject, overflow result reject,
 *                     out capacity 부족 + 원자성, out === a / out === b aliasing 허용,
 *                     out truncate.
 */

import { describe, expect, test } from 'vitest';
import { addMatrices } from '../../../src/linalg/add-matrices';
import { addMatricesInto } from '../../../src/linalg/add-matrices-into';

// ---------------------------------------------------------------------------
// addMatricesInto / addMatrices
// ---------------------------------------------------------------------------

describe('addMatricesInto — element-wise matrix add (Into)', () => {
  test('same shape에서 entry별 합을 기록하고 out을 반환한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
    ];
    const result = addMatricesInto(
      out,
      [
        [1, 2, 3],
        [4, 5, 6],
      ],
      [
        [10, 20, 30],
        [40, 50, 60],
      ]
    );
    expect(result).toBe(out);
    expect(out).toEqual([
      [11, 22, 33],
      [44, 55, 66],
    ]);
  });

  test('out row 또는 row capacity가 더 크면 target shape로 truncate한다', () => {
    const out: number[][] = [
      [9, 9, 9, 9],
      [9, 9, 9, 9],
      [9, 9, 9, 9],
    ];
    addMatricesInto(
      out,
      [
        [1, 2],
        [3, 4],
      ],
      [
        [5, 6],
        [7, 8],
      ]
    );
    expect(out).toEqual([
      [6, 8],
      [10, 12],
    ]);
  });

  test('빈 matrix `[]` 두 개는 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9], [9]];
    addMatricesInto(out, [], []);
    expect(out).toEqual([]);
  });

  test('shape mismatch는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      addMatricesInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        [[1, 2, 3]]
      )
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('ragged matrix는 RangeError', () => {
    const out: number[][] = [];
    expect(() =>
      addMatricesInto(out, [[1, 2], [3]] as unknown as number[][], [
        [1, 2],
        [3, 4],
      ])
    ).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'non-finite entry %s는 RangeError를 던지고 out을 수정하지 않는다',
    (bad) => {
      const out: number[][] = [
        [9, 9],
        [9, 9],
      ];
      expect(() =>
        addMatricesInto(
          out,
          [
            [1, 2],
            [3, bad],
          ],
          [
            [1, 1],
            [1, 1],
          ]
        )
      ).toThrow(RangeError);
      expect(out).toEqual([
        [9, 9],
        [9, 9],
      ]);
    }
  );

  test('합 overflow(Number.MAX_VALUE + Number.MAX_VALUE = Infinity)는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => addMatricesInto(out, [[Number.MAX_VALUE]], [[Number.MAX_VALUE]])).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('out row 개수가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() =>
      addMatricesInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ]
      )
    ).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out row capacity가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9], [9]];
    expect(() =>
      addMatricesInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ]
      )
    ).toThrow(RangeError);
    expect(out).toEqual([[9], [9]]);
  });

  test('out === a aliasing이 허용된다 (temp matrix에서 계산 후 commit)', () => {
    const a: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const b: number[][] = [
      [10, 20],
      [30, 40],
    ];
    const result = addMatricesInto(a, a, b);
    expect(result).toBe(a);
    expect(a).toEqual([
      [11, 22],
      [33, 44],
    ]);
  });

  test('out === b aliasing이 허용된다', () => {
    const a: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const b: number[][] = [
      [10, 20],
      [30, 40],
    ];
    addMatricesInto(b, a, b);
    expect(b).toEqual([
      [11, 22],
      [33, 44],
    ]);
  });
});

describe('addMatrices — element-wise matrix add (companion)', () => {
  test('새 number[][] 배열을 반환한다', () => {
    const result = addMatrices(
      [
        [1, 2],
        [3, 4],
      ],
      [
        [5, 6],
        [7, 8],
      ]
    );
    expect(result).toEqual([
      [6, 8],
      [10, 12],
    ]);
  });

  test('input matrix를 alias하지 않는다 (deep copy)', () => {
    const a: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const b: number[][] = [
      [5, 6],
      [7, 8],
    ];
    const result = addMatrices(a, b);
    a[0][0] = 999;
    b[0][0] = 999;
    expect(result[0][0]).toBe(6);
  });

  test('빈 matrix 두 개는 빈 배열을 반환한다', () => {
    expect(addMatrices([], [])).toEqual([]);
  });

  test('shape mismatch는 RangeError', () => {
    expect(() => addMatrices([[1, 2]], [[1, 2, 3]])).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => addMatrices([[Number.NaN]], [[1]])).toThrow(RangeError);
  });

  test('합 overflow는 RangeError', () => {
    expect(() => addMatrices([[Number.MAX_VALUE]], [[Number.MAX_VALUE]])).toThrow(RangeError);
  });
});
