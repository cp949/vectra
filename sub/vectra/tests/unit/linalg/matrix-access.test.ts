/**
 * linalg matrix shape/access helper unit test.
 *
 * shape — rectangular/finite validation, empty matrix, `[[]]` reject.
 * row(Into) / column(Into) — index 정수성과 범위, capacity 부족 시 out 미수정.
 * diagonal(Into) — non-square, empty matrix, capacity 부족.
 * transpose(Into) — rectangular/empty, capacity, aliasing reject.
 * trace — square 요구, 빈 matrix, finite entry, 누적 합 overflow.
 */

import { describe, expect, test } from 'vitest';
import { column } from '../../../src/linalg/column';
import { columnInto } from '../../../src/linalg/column-into';
import { diagonal } from '../../../src/linalg/diagonal';
import { diagonalInto } from '../../../src/linalg/diagonal-into';
import { row } from '../../../src/linalg/row';
import { rowInto } from '../../../src/linalg/row-into';
import { shape } from '../../../src/linalg/shape';
import { trace } from '../../../src/linalg/trace';
import { transpose } from '../../../src/linalg/transpose';
import { transposeInto } from '../../../src/linalg/transpose-into';

// ---------------------------------------------------------------------------
// shape
// ---------------------------------------------------------------------------

describe('shape — matrix shape 추출', () => {
  test('rectangular matrix는 [rows, columns] tuple을 반환한다', () => {
    expect(shape([[1, 2, 3]])).toEqual([1, 3]);
    expect(
      shape([
        [1, 2],
        [3, 4],
        [5, 6],
      ])
    ).toEqual([3, 2]);
  });

  test('빈 matrix `[]`는 [0, 0]을 반환한다', () => {
    expect(shape([])).toEqual([0, 0]);
  });

  test('호출마다 새 tuple을 반환한다(같은 참조를 재사용하지 않는다)', () => {
    const a = shape([[1]]);
    const b = shape([[1]]);
    expect(a).not.toBe(b);
    expect(a).toEqual([1, 1]);
    expect(b).toEqual([1, 1]);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() =>
      shape([
        [1, 2],
        [3, 4, 5],
      ])
    ).toThrow(RangeError);
  });

  test('one-sided zero shape `[[]]`은 RangeError', () => {
    expect(() => shape([[]])).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => shape([[Number.NaN]])).toThrow(RangeError);
    expect(() => shape([[1, Number.POSITIVE_INFINITY]])).toThrow(RangeError);
    expect(() => shape([[1, Number.NEGATIVE_INFINITY]])).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// rowInto / row
// ---------------------------------------------------------------------------

describe('rowInto — row 추출 (Into)', () => {
  test('정상 row를 복사해 out에 기록하고 out을 반환한다', () => {
    const out: number[] = [0, 0, 0];
    const result = rowInto(
      out,
      [
        [1, 2, 3],
        [4, 5, 6],
      ],
      1
    );
    expect(result).toBe(out);
    expect(out).toEqual([4, 5, 6]);
  });

  test('out 길이가 columns보다 크면 columns로 truncate한다', () => {
    const out = [9, 9, 9, 9, 9];
    rowInto(out, [[1, 2]], 0);
    expect(out).toEqual([1, 2]);
  });

  test('out capacity가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out = [9];
    expect(() => rowInto(out, [[1, 2, 3]], 0)).toThrow(RangeError);
    expect(out).toEqual([9]);
  });

  test.each([
    -1,
    0.5,
    1,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('invalid rowIndex %s는 RangeError를 던지고 out을 수정하지 않는다', (idx) => {
    const out = [9, 9, 9];
    expect(() => rowInto(out, [[1, 2, 3]], idx)).toThrow(RangeError);
    expect(out).toEqual([9, 9, 9]);
  });

  test('빈 matrix는 어떤 rowIndex여도 RangeError', () => {
    const out = [9];
    expect(() => rowInto(out, [], 0)).toThrow(RangeError);
    expect(out).toEqual([9]);
  });

  test('ragged matrix는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out = [9, 9];
    expect(() =>
      rowInto(
        out,
        [
          [1, 2],
          [3, 4, 5],
        ],
        0
      )
    ).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('non-finite matrix entry는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out = [9, 9];
    expect(() => rowInto(out, [[1, Number.NaN]], 0)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });
});

describe('row — row 추출 (companion)', () => {
  test('새 number[] 배열을 반환한다', () => {
    expect(
      row(
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
        0
      )
    ).toEqual([1, 2, 3]);
  });

  test('invalid rowIndex는 RangeError', () => {
    expect(() => row([[1]], 1)).toThrow(RangeError);
    expect(() => row([[1, 2]], 0.5)).toThrow(RangeError);
  });

  test('빈 matrix는 RangeError', () => {
    expect(() => row([], 0)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// columnInto / column
// ---------------------------------------------------------------------------

describe('columnInto — column 추출 (Into)', () => {
  test('정상 column을 복사해 out에 기록하고 out을 반환한다', () => {
    const out: number[] = [0, 0];
    const result = columnInto(
      out,
      [
        [1, 2, 3],
        [4, 5, 6],
      ],
      2
    );
    expect(result).toBe(out);
    expect(out).toEqual([3, 6]);
  });

  test('out 길이가 rows보다 크면 rows로 truncate한다', () => {
    const out = [9, 9, 9, 9, 9];
    columnInto(out, [[1, 2]], 1);
    expect(out).toEqual([2]);
  });

  test('out capacity가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out = [9];
    expect(() =>
      columnInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        0
      )
    ).toThrow(RangeError);
    expect(out).toEqual([9]);
  });

  test.each([
    -1,
    0.5,
    2,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('invalid columnIndex %s는 RangeError를 던지고 out을 수정하지 않는다', (idx) => {
    const out = [9, 9];
    expect(() =>
      columnInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        idx
      )
    ).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('빈 matrix는 어떤 columnIndex여도 RangeError', () => {
    const out = [9];
    expect(() => columnInto(out, [], 0)).toThrow(RangeError);
    expect(out).toEqual([9]);
  });
});

describe('column — column 추출 (companion)', () => {
  test('새 number[] 배열을 반환한다', () => {
    expect(
      column(
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
        1
      )
    ).toEqual([2, 5]);
  });

  test('invalid columnIndex는 RangeError', () => {
    expect(() => column([[1]], 1)).toThrow(RangeError);
    expect(() => column([[1, 2]], 1.5)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// diagonalInto / diagonal
// ---------------------------------------------------------------------------

describe('diagonalInto — main diagonal 추출 (Into)', () => {
  test('square matrix의 diagonal을 복사해 out에 기록한다', () => {
    const out: number[] = [0, 0, 0];
    const result = diagonalInto(out, [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    expect(result).toBe(out);
    expect(out).toEqual([1, 5, 9]);
  });

  test('rows < columns rectangular matrix는 rows 길이의 diagonal을 반환한다', () => {
    const out: number[] = [0, 0];
    diagonalInto(out, [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
    ]);
    expect(out).toEqual([1, 6]);
  });

  test('rows > columns rectangular matrix는 columns 길이의 diagonal을 반환한다', () => {
    const out: number[] = [0, 0];
    diagonalInto(out, [
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
    expect(out).toEqual([1, 4]);
  });

  test('out 길이가 더 크면 diagonal length로 truncate한다', () => {
    const out = [9, 9, 9, 9, 9];
    diagonalInto(out, [
      [1, 2],
      [3, 4],
    ]);
    expect(out).toEqual([1, 4]);
  });

  test('빈 matrix는 out.length = 0만 설정한다', () => {
    const out = [9, 9];
    diagonalInto(out, []);
    expect(out).toEqual([]);
  });

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out = [9];
    expect(() =>
      diagonalInto(out, [
        [1, 2],
        [3, 4],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([9]);
  });
});

describe('diagonal — main diagonal 추출 (companion)', () => {
  test('새 number[] 배열을 반환한다', () => {
    expect(
      diagonal([
        [1, 2],
        [3, 4],
      ])
    ).toEqual([1, 4]);
  });

  test('빈 matrix는 빈 배열을 반환한다', () => {
    expect(diagonal([])).toEqual([]);
  });

  test('rectangular matrix는 min(rows, columns) 길이를 반환한다', () => {
    expect(
      diagonal([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toEqual([1, 5]);
  });
});

// ---------------------------------------------------------------------------
// transposeInto / transpose
// ---------------------------------------------------------------------------

describe('transposeInto — matrix transpose (Into)', () => {
  test('rectangular matrix를 transpose해 out에 기록하고 out을 반환한다', () => {
    const out: number[][] = [
      [0, 0],
      [0, 0],
      [0, 0],
    ];
    const result = transposeInto(out, [
      [1, 2, 3],
      [4, 5, 6],
    ]);
    expect(result).toBe(out);
    expect(out).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });

  test('square matrix(non-alias)도 정상적으로 transpose한다', () => {
    const out: number[][] = [
      [0, 0],
      [0, 0],
    ];
    transposeInto(out, [
      [1, 2],
      [3, 4],
    ]);
    expect(out).toEqual([
      [1, 3],
      [2, 4],
    ]);
  });

  test('out row 또는 column capacity가 더 크면 target shape로 truncate한다', () => {
    const out: number[][] = [
      [9, 9, 9, 9],
      [9, 9, 9, 9],
      [9, 9, 9, 9],
      [9, 9, 9, 9],
    ];
    transposeInto(out, [
      [1, 2, 3],
      [4, 5, 6],
    ]);
    expect(out).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });

  test('빈 matrix는 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9], [9]];
    transposeInto(out, []);
    expect(out).toEqual([]);
  });

  test('out row 개수가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() =>
      transposeInto(out, [
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out row가 array가 아니면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out = [null, [0, 0]] as unknown as number[][];
    expect(() =>
      transposeInto(out, [
        [1, 2],
        [3, 4],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([null, [0, 0]]);
  });

  test('out row capacity가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9], [9]];
    expect(() =>
      transposeInto(out, [
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([[9], [9]]);
  });

  test('aliasing(out === matrix)은 RangeError', () => {
    const m: number[][] = [
      [1, 2],
      [3, 4],
    ];
    expect(() => transposeInto(m, m)).toThrow(RangeError);
    expect(m).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test('ragged matrix는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      transposeInto(out, [
        [1, 2],
        [3, 4, 5],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('non-finite entry는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      transposeInto(out, [
        [1, Number.NaN],
        [3, 4],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });
});

describe('transpose — matrix transpose (companion)', () => {
  test('새 number[][] 배열을 반환한다', () => {
    expect(
      transpose([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });

  test('빈 matrix는 빈 배열을 반환한다', () => {
    expect(transpose([])).toEqual([]);
  });

  test('단일 row matrix는 column vector matrix로 변환된다', () => {
    expect(transpose([[1, 2, 3]])).toEqual([[1], [2], [3]]);
  });
});

// ---------------------------------------------------------------------------
// trace
// ---------------------------------------------------------------------------

describe('trace — square matrix diagonal 합', () => {
  test('square matrix의 diagonal 합을 반환한다', () => {
    expect(
      trace([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
    ).toBe(15);
  });

  test('1x1 matrix는 단일 entry 값을 반환한다', () => {
    expect(trace([[42]])).toBe(42);
  });

  test('빈 matrix는 0을 반환한다', () => {
    expect(trace([])).toBe(0);
  });

  test('non-square matrix는 RangeError', () => {
    expect(() =>
      trace([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => trace([[Number.NaN]])).toThrow(RangeError);
    expect(() => trace([[Number.POSITIVE_INFINITY]])).toThrow(RangeError);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() =>
      trace([
        [1, 2],
        [3, 4, 5],
      ])
    ).toThrow(RangeError);
  });

  test('finite entry지만 누적 합이 overflow되면 RangeError', () => {
    const huge = Number.MAX_VALUE;
    expect(() =>
      trace([
        [huge, 0],
        [0, huge],
      ])
    ).toThrow(RangeError);
  });
});
