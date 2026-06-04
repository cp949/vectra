/**
 * linalg matrix Hadamard (element-wise) product unit test.
 *
 * hadamardMatrixProduct(Into) — same-shape product, overflow result reject,
 *                               non-finite entry reject, shape mismatch reject,
 *                               out capacity 부족 + 원자성,
 *                               out === a / out === b aliasing 허용, empty matrix.
 */

import { describe, expect, test } from 'vitest';
import { hadamardMatrixProduct } from '../../../src/linalg/hadamard-matrix-product';
import { hadamardMatrixProductInto } from '../../../src/linalg/hadamard-matrix-product-into';

// ---------------------------------------------------------------------------
// hadamardMatrixProductInto / hadamardMatrixProduct
// ---------------------------------------------------------------------------

describe('hadamardMatrixProductInto — element-wise matrix product (Into)', () => {
  test('same shape에서 entry별 곱을 기록한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
    ];
    const result = hadamardMatrixProductInto(
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
      [10, 40, 90],
      [160, 250, 360],
    ]);
  });

  test('빈 matrix는 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9]];
    hadamardMatrixProductInto(out, [], []);
    expect(out).toEqual([]);
  });

  test('shape mismatch는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() => hadamardMatrixProductInto(out, [[1, 2]], [[1]])).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('곱 overflow(Number.MAX_VALUE * Number.MAX_VALUE = Infinity)는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => hadamardMatrixProductInto(out, [[Number.MAX_VALUE]], [[Number.MAX_VALUE]])).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('non-finite entry %s는 RangeError를 던지고 out을 수정하지 않는다', (bad) => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      hadamardMatrixProductInto(
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
    hadamardMatrixProductInto(a, a, b);
    expect(a).toEqual([
      [10, 20],
      [30, 40],
    ]);
  });

  test('out === b aliasing이 허용된다', () => {
    const a: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const b: number[][] = [
      [10, 10],
      [10, 10],
    ];
    hadamardMatrixProductInto(b, a, b);
    expect(b).toEqual([
      [10, 20],
      [30, 40],
    ]);
  });

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() =>
      hadamardMatrixProductInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        [
          [1, 1],
          [1, 1],
        ]
      )
    ).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });
});

describe('hadamardMatrixProduct — element-wise matrix product (companion)', () => {
  test('새 number[][] 배열을 반환한다', () => {
    expect(
      hadamardMatrixProduct(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [10, 20],
          [30, 40],
        ]
      )
    ).toEqual([
      [10, 40],
      [90, 160],
    ]);
  });

  test('빈 matrix는 빈 배열을 반환한다', () => {
    expect(hadamardMatrixProduct([], [])).toEqual([]);
  });

  test('shape mismatch는 RangeError', () => {
    expect(() => hadamardMatrixProduct([[1, 2]], [[1]])).toThrow(RangeError);
  });

  test('곱 overflow는 RangeError', () => {
    expect(() => hadamardMatrixProduct([[Number.MAX_VALUE]], [[Number.MAX_VALUE]])).toThrow(RangeError);
  });
});
