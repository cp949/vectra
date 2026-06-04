/**
 * chainProduct / chainProductInto 단위 테스트.
 * 3개 matrix chain, 직사각 chain, 1개 matrix deep copy,
 * empty chain reject, 인접 shape mismatch, overflow 전파,
 * non-finite 입력, ragged matrix,
 * out capacity 부족 + 원자성, out === matrices[i] aliasing을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { chainProduct } from '../../../src/linalg/chain-product';
import { chainProductInto } from '../../../src/linalg/chain-product-into';

describe('chainProductInto — matrix chain product (Into)', () => {
  test('3개 matrix chain은 좌-우 누적 곱을 out에 기록한다', () => {
    const a: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const b: number[][] = [
      [5, 6],
      [7, 8],
    ];
    const c: number[][] = [
      [1, 0],
      [0, 1],
    ];
    const out: number[][] = [
      [0, 0],
      [0, 0],
    ];
    const result = chainProductInto(out, [a, b, c]);
    expect(result).toBe(out);
    // A*B = [[19,22],[43,50]]; *C(identity) = same
    expect(out).toEqual([
      [19, 22],
      [43, 50],
    ]);
  });

  test('rectangular chain (2x3 * 3x2 * 2x1) 은 [2, 1] 결과를 기록한다', () => {
    const a: number[][] = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    const b: number[][] = [
      [1, 0],
      [0, 1],
      [1, 1],
    ];
    const c: number[][] = [[2], [3]];
    const out: number[][] = [[0], [0]];
    chainProductInto(out, [a, b, c]);
    // A*B = [[4,5],[10,11]]; *C = [[4*2+5*3],[10*2+11*3]] = [[23],[53]]
    expect(out).toEqual([[23], [53]]);
  });

  test('1개 matrix는 deep copy를 out에 기록한다', () => {
    const m: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const out: number[][] = [
      [0, 0],
      [0, 0],
    ];
    chainProductInto(out, [m]);
    expect(out).toEqual([
      [1, 2],
      [3, 4],
    ]);
    // 원본 mutate가 out에 영향을 주지 않음 → deep copy 확인
    m[0][0] = 999;
    expect(out).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test('out에 deep copy만 한 결과는 입력 row와 분리된 새 배열이다', () => {
    const m: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const out: number[][] = [
      [0, 0],
      [0, 0],
    ];
    chainProductInto(out, [m]);
    expect(out[0]).not.toBe(m[0]);
  });

  test('empty chain은 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() => chainProductInto(out, [])).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('인접 shape mismatch (가운데)는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      chainProductInto(out, [
        [
          [1, 2],
          [3, 4],
        ],
        [[1, 2, 3]],
        [
          [1, 0],
          [0, 1],
        ],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('중간 누적 entry overflow는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => chainProductInto(out, [[[Number.MAX_VALUE, Number.MAX_VALUE]], [[1], [1]], [[1]]])).toThrow(
      RangeError
    );
    expect(out).toEqual([[9]]);
  });

  test('non-finite entry는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => chainProductInto(out, [[[1]], [[Number.NaN]]])).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('ragged matrix는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() => chainProductInto(out, [[[1, 2], [3]] as unknown as number[][]])).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out row 개수가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() =>
      chainProductInto(out, [
        [
          [1, 2],
          [3, 4],
        ],
        [
          [1, 0],
          [0, 1],
        ],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out row capacity가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9], [9]];
    expect(() =>
      chainProductInto(out, [
        [
          [1, 2],
          [3, 4],
        ],
        [
          [1, 0],
          [0, 1],
        ],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([[9], [9]]);
  });

  test('out === matrices[0] aliasing이 허용된다', () => {
    const a: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const b: number[][] = [
      [5, 6],
      [7, 8],
    ];
    const result = chainProductInto(a, [a, b]);
    expect(result).toBe(a);
    expect(a).toEqual([
      [19, 22],
      [43, 50],
    ]);
  });

  test('out === matrices[last] aliasing이 허용된다', () => {
    const a: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const b: number[][] = [
      [5, 6],
      [7, 8],
    ];
    chainProductInto(b, [a, b]);
    expect(b).toEqual([
      [19, 22],
      [43, 50],
    ]);
  });
});

describe('chainProduct — matrix chain product (companion)', () => {
  test('3개 matrix chain의 새 number[][] 결과를 반환한다', () => {
    expect(
      chainProduct([
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
        [
          [1, 0],
          [0, 1],
        ],
      ])
    ).toEqual([
      [19, 22],
      [43, 50],
    ]);
  });

  test('1개 matrix는 deep copy를 반환한다', () => {
    const m: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const result = chainProduct([m]);
    expect(result).toEqual([
      [1, 2],
      [3, 4],
    ]);
    m[0][0] = 999;
    expect(result[0][0]).toBe(1);
  });

  test('empty chain은 RangeError', () => {
    expect(() => chainProduct([])).toThrow(RangeError);
  });

  test('인접 shape mismatch는 RangeError', () => {
    expect(() => chainProduct([[[1, 2]], [[1, 2]]])).toThrow(RangeError);
  });

  test('누적 overflow는 RangeError', () => {
    expect(() => chainProduct([[[Number.MAX_VALUE, Number.MAX_VALUE]], [[1], [1]]])).toThrow(RangeError);
  });
});
