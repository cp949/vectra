/**
 * multiplyMatrices / multiplyMatricesInto 단위 테스트.
 * 직사각 / 정방 행렬 곱, 빈 행렬, shape mismatch,
 * non-finite 입력, overflow, out capacity 부족 + 원자성,
 * out === a / out === b aliasing을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { multiplyMatrices } from '../../../src/linalg/multiply-matrices';
import { multiplyMatricesInto } from '../../../src/linalg/multiply-matrices-into';

describe('multiplyMatricesInto — matrix multiplication (Into)', () => {
  test('rectangular multiply (2x3 * 3x2)는 [aRows, bColumns] shape를 기록한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    const result = multiplyMatricesInto(
      out,
      [
        [1, 2, 3],
        [4, 5, 6],
      ],
      [
        [7, 8],
        [9, 10],
        [11, 12],
      ]
    );
    expect(result).toBe(out);
    expect(out).toEqual([
      [58, 64],
      [139, 154],
    ]);
  });

  test('square 2x2 multiply는 정상 entry를 기록한다', () => {
    const out: number[][] = [
      [0, 0],
      [0, 0],
    ];
    multiplyMatricesInto(
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
      [19, 22],
      [43, 50],
    ]);
  });

  test('빈 matrix [] × [] 은 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9], [9]];
    multiplyMatricesInto(out, [], []);
    expect(out).toEqual([]);
  });

  test('a.columns !== b.rows 이면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() => multiplyMatricesInto(out, [[1, 2, 3]], [[1, 2]])).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('non-finite input은 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => multiplyMatricesInto(out, [[Number.NaN]], [[1]])).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('누적 합 overflow(Infinity)는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => multiplyMatricesInto(out, [[Number.MAX_VALUE, Number.MAX_VALUE]], [[1], [1]])).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('out row 개수가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() =>
      multiplyMatricesInto(
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
      multiplyMatricesInto(
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

  test('out === a aliasing이 허용된다 (square multiply)', () => {
    const a: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const b: number[][] = [
      [5, 6],
      [7, 8],
    ];
    const result = multiplyMatricesInto(a, a, b);
    expect(result).toBe(a);
    expect(a).toEqual([
      [19, 22],
      [43, 50],
    ]);
  });

  test('out === b aliasing이 허용된다 (square multiply)', () => {
    const a: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const b: number[][] = [
      [5, 6],
      [7, 8],
    ];
    multiplyMatricesInto(b, a, b);
    expect(b).toEqual([
      [19, 22],
      [43, 50],
    ]);
  });

  test('out row 개수가 더 크면 target shape로 truncate한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    multiplyMatricesInto(
      out,
      [[1, 2, 3]],
      [
        [1, 0],
        [0, 1],
        [1, 1],
      ]
    );
    expect(out).toEqual([[4, 5]]);
  });
});

describe('multiplyMatrices — matrix multiplication (companion)', () => {
  test('새 number[][] 배열을 [aRows, bColumns] shape로 반환한다', () => {
    expect(
      multiplyMatrices(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ]
      )
    ).toEqual([
      [19, 22],
      [43, 50],
    ]);
  });

  test('input matrix를 alias하지 않는다 (deep copy)', () => {
    const a: number[][] = [[1, 2]];
    const b: number[][] = [[3], [4]];
    const result = multiplyMatrices(a, b);
    a[0][0] = 999;
    b[0][0] = 999;
    expect(result).toEqual([[11]]);
  });

  test('빈 matrix 두 개는 빈 배열을 반환한다', () => {
    expect(multiplyMatrices([], [])).toEqual([]);
  });

  test('shape mismatch는 RangeError', () => {
    expect(() => multiplyMatrices([[1, 2, 3]], [[1, 2]])).toThrow(RangeError);
  });

  test('non-finite input은 RangeError', () => {
    expect(() => multiplyMatrices([[Number.NaN]], [[1]])).toThrow(RangeError);
  });

  test('누적 합 overflow는 RangeError', () => {
    expect(() => multiplyMatrices([[Number.MAX_VALUE, Number.MAX_VALUE]], [[1], [1]])).toThrow(RangeError);
  });
});
