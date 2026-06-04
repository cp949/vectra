/**
 * kroneckerProduct / kroneckerProductInto 단위 테스트.
 * 표준 2x2 ⊗ 2x2, 직사각 케이스, 빈 matrix,
 * 곱 entry overflow, non-finite 입력,
 * result shape overflow guard, out capacity 부족 + 원자성,
 * out === a / out === b aliasing을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { kroneckerProduct } from '../../../src/linalg/kronecker-product';
import { kroneckerProductInto } from '../../../src/linalg/kronecker-product-into';

describe('kroneckerProductInto — Kronecker product (Into)', () => {
  test('표준 2x2 ⊗ 2x2 는 4x4 결과를 기록한다', () => {
    const out: number[][] = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = kroneckerProductInto(
      out,
      [
        [1, 2],
        [3, 4],
      ],
      [
        [0, 5],
        [6, 7],
      ]
    );
    expect(result).toBe(out);
    // [[1*B, 2*B], [3*B, 4*B]] where B = [[0,5],[6,7]]
    expect(out).toEqual([
      [0, 5, 0, 10],
      [6, 7, 12, 14],
      [0, 15, 0, 20],
      [18, 21, 24, 28],
    ]);
  });

  test('rectangular 1x2 ⊗ 2x1 은 2x2 결과를 기록한다', () => {
    const out: number[][] = [
      [0, 0],
      [0, 0],
    ];
    kroneckerProductInto(out, [[1, 2]], [[3], [4]]);
    expect(out).toEqual([
      [3, 6],
      [4, 8],
    ]);
  });

  test('a가 빈 matrix이면 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9]];
    kroneckerProductInto(out, [], [[1, 2]]);
    expect(out).toEqual([]);
  });

  test('b가 빈 matrix이면 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9]];
    kroneckerProductInto(out, [[1, 2]], []);
    expect(out).toEqual([]);
  });

  test('곱 entry overflow는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => kroneckerProductInto(out, [[Number.MAX_VALUE]], [[Number.MAX_VALUE]])).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('non-finite input은 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => kroneckerProductInto(out, [[Number.POSITIVE_INFINITY]], [[1]])).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('결과 shape가 safe integer를 벗어나면 RangeError를 던지고 out을 수정하지 않는다', () => {
    // matrix[0].length가 2^27인 sparse Proxy를 만들어 column overflow를 유도한다.
    // 실제 entry 접근은 발생하지 않으므로 finite 검사 비용은 없다.
    const makeWideRow = (): readonly number[] =>
      new Proxy([0] as readonly number[], {
        get(target, prop, receiver) {
          if (prop === 'length') return 2 ** 27;
          if (typeof prop === 'string' && /^\d+$/.test(prop)) return 0;
          return Reflect.get(target, prop, receiver);
        },
      });
    const wide: readonly (readonly number[])[] = [makeWideRow()];
    const out: number[][] = [];
    expect(() => kroneckerProductInto(out, wide, wide)).toThrow(RangeError);
    expect(out).toEqual([]);
  });

  test('out row 개수가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() =>
      kroneckerProductInto(
        out,
        [
          [1, 0],
          [0, 1],
        ],
        [[1]]
      )
    ).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out row capacity가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9], [9]];
    expect(() => kroneckerProductInto(out, [[1], [2]], [[1, 2]])).toThrow(RangeError);
    expect(out).toEqual([[9], [9]]);
  });

  test('out === a aliasing이 허용된다 (square 2x2 ⊗ 1x1)', () => {
    const a: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const result = kroneckerProductInto(a, a, [[10]]);
    expect(result).toBe(a);
    expect(a).toEqual([
      [10, 20],
      [30, 40],
    ]);
  });

  test('out === b aliasing이 허용된다 (1x1 ⊗ 2x2)', () => {
    const b: number[][] = [
      [1, 2],
      [3, 4],
    ];
    kroneckerProductInto(b, [[10]], b);
    expect(b).toEqual([
      [10, 20],
      [30, 40],
    ]);
  });
});

describe('kroneckerProduct — Kronecker product (companion)', () => {
  test('새 number[][] 배열을 반환한다 (2x2 ⊗ 2x2)', () => {
    expect(
      kroneckerProduct(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [0, 5],
          [6, 7],
        ]
      )
    ).toEqual([
      [0, 5, 0, 10],
      [6, 7, 12, 14],
      [0, 15, 0, 20],
      [18, 21, 24, 28],
    ]);
  });

  test('빈 matrix 한쪽이면 빈 배열을 반환한다', () => {
    expect(kroneckerProduct([], [[1]])).toEqual([]);
    expect(kroneckerProduct([[1]], [])).toEqual([]);
  });

  test('곱 entry overflow는 RangeError', () => {
    expect(() => kroneckerProduct([[Number.MAX_VALUE]], [[Number.MAX_VALUE]])).toThrow(RangeError);
  });
});
