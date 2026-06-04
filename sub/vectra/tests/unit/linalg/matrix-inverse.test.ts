/**
 * linalg inverseInto, inverse 함수의 단위 테스트.
 *
 * inverseInto — identity, 2x2 known inverse, 3x3 inverse(A * A^{-1} = I), row swap 케이스,
 *               singular false(out 미수정), 빈 matrix(true + length=0), non-square RangeError,
 *               output capacity 부족, aliasing 허용, -0 미보존, non-finite entry, invalid epsilon,
 *               custom epsilon singular 판정.
 * inverse     — non-singular 결과, singular undefined, 빈 matrix([]), non-square/non-finite RangeError,
 *               input row 참조 공유 안 함, invalid epsilon.
 */

import { describe, expect, test } from 'vitest';
import { inverse } from '../../../src/linalg/inverse';
import { inverseInto } from '../../../src/linalg/inverse-into';

// ---------------------------------------------------------------------------
// inverseInto
// ---------------------------------------------------------------------------

describe('inverseInto — square matrix inverse (boolean-primary Into)', () => {
  test('identity matrix는 자기 자신을 반환한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    const ok = inverseInto(out, [
      [1, 0],
      [0, 1],
    ]);
    expect(ok).toBe(true);
    expect(out).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });

  test('2x2 matrix의 역행렬이 알려진 값과 일치한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    // [[4,7],[2,6]] inverse = [[0.6, -0.7], [-0.2, 0.4]]
    const ok = inverseInto(out, [
      [4, 7],
      [2, 6],
    ]);
    expect(ok).toBe(true);
    expect(out[0][0]).toBeCloseTo(0.6, 12);
    expect(out[0][1]).toBeCloseTo(-0.7, 12);
    expect(out[1][0]).toBeCloseTo(-0.2, 12);
    expect(out[1][1]).toBeCloseTo(0.4, 12);
  });

  test('3x3 inverse는 A * A^{-1} = I를 만족한다', () => {
    const A: readonly (readonly number[])[] = [
      [1, 2, 3],
      [0, 1, 4],
      [5, 6, 0],
    ];
    const inv: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    const ok = inverseInto(inv, A);
    expect(ok).toBe(true);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let k = 0; k < 3; k++) {
          sum += A[r][k] * inv[k][c];
        }
        expect(sum).toBeCloseTo(r === c ? 1 : 0, 10);
      }
    }
  });

  test('row swap이 필요한 matrix에서도 정확한 inverse를 반환한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    // [[0,1],[1,0]] inverse = [[0,1],[1,0]] (involution).
    const ok = inverseInto(out, [
      [0, 1],
      [1, 0],
    ]);
    expect(ok).toBe(true);
    expect(out).toEqual([
      [0, 1],
      [1, 0],
    ]);
  });

  test('singular matrix는 false를 반환하고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    const ok = inverseInto(out, [
      [1, 2],
      [2, 4],
    ]);
    expect(ok).toBe(false);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('singular이면서 out capacity가 부족해도 false를 반환한다 (singular 판정이 우선)', () => {
    // singular check가 commit(capacity check) 전에 수행되므로 RangeError가 던져지지 않는다.
    const out: number[][] = [[9]];
    const ok = inverseInto(out, [
      [1, 2],
      [2, 4],
    ]);
    expect(ok).toBe(false);
    expect(out).toEqual([[9]]);
  });

  test('빈 matrix는 빈 inverse (true, out.length = 0)', () => {
    const out: number[][] = [[9], [9]];
    const ok = inverseInto(out, []);
    expect(ok).toBe(true);
    expect(out).toEqual([]);
  });

  test('non-square matrix는 RangeError', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      inverseInto(out, [
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('non-finite entry는 RangeError', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      inverseInto(out, [
        [Number.NaN, 0],
        [0, 1],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('non-singular인데 out capacity가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() =>
      inverseInto(out, [
        [1, 0],
        [0, 1],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('out === matrix aliasing이 허용된다', () => {
    const m: number[][] = [
      [4, 7],
      [2, 6],
    ];
    const ok = inverseInto(m, m);
    expect(ok).toBe(true);
    expect(m[0][0]).toBeCloseTo(0.6, 12);
    expect(m[0][1]).toBeCloseTo(-0.7, 12);
    expect(m[1][0]).toBeCloseTo(-0.2, 12);
    expect(m[1][1]).toBeCloseTo(0.4, 12);
  });

  test('-0이 결과에 남지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    inverseInto(out, [
      [-1, 0],
      [0, -1],
    ]);
    // inverse = [[-1, 0], [0, -1]]. 0 자리에 -0이 남지 않아야 한다.
    expect(Object.is(out[0][1], -0)).toBe(false);
    expect(Object.is(out[1][0], -0)).toBe(false);
  });

  test('custom epsilon으로 작은 pivot을 singular로 판정한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    const ok = inverseInto(
      out,
      [
        [1e-12, 0],
        [0, 1e-12],
      ],
      { epsilon: 1e-9 }
    );
    expect(ok).toBe(false);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('유효하지 않은 epsilon %s는 RangeError를 던진다', (bad) => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      inverseInto(
        out,
        [
          [1, 0],
          [0, 1],
        ],
        { epsilon: bad }
      )
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('성공 시 같은 out 인스턴스를 반환한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    const result = inverseInto(out, [
      [1, 0],
      [0, 1],
    ]);
    expect(result).toBe(true);
  });

  test('성공 시 row length가 columns에 맞게 truncate된다', () => {
    const out: number[][] = [
      [9, 9, 9, 9],
      [9, 9, 9, 9],
      [9, 9, 9, 9],
    ];
    inverseInto(out, [
      [1, 0],
      [0, 1],
    ]);
    // out.length = 2, 각 row length = 2로 truncate.
    expect(out.length).toBe(2);
    expect(out[0].length).toBe(2);
    expect(out[1].length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// inverse (companion)
// ---------------------------------------------------------------------------

describe('inverse — square matrix inverse (companion)', () => {
  test('non-singular matrix는 inverse를 반환한다', () => {
    const result = inverse([
      [4, 7],
      [2, 6],
    ]);
    if (result === undefined) {
      throw new Error('inverse를 기대했으나 undefined 반환');
    }
    expect(result[0][0]).toBeCloseTo(0.6, 12);
    expect(result[0][1]).toBeCloseTo(-0.7, 12);
  });

  test('singular matrix는 undefined를 반환한다', () => {
    expect(
      inverse([
        [1, 2],
        [2, 4],
      ])
    ).toBeUndefined();
  });

  test('빈 matrix는 빈 배열을 반환한다', () => {
    expect(inverse([])).toEqual([]);
  });

  test('non-square는 RangeError', () => {
    expect(() =>
      inverse([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => inverse([[Number.NaN]])).toThrow(RangeError);
  });

  test('새 number[][]을 반환하고 input row 참조를 공유하지 않는다', () => {
    const m: number[][] = [
      [1, 0],
      [0, 1],
    ];
    const result = inverse(m);
    if (result === undefined) {
      throw new Error('inverse를 기대했으나 undefined 반환');
    }
    m[0][0] = 999;
    m[1][1] = 999;
    expect(result[0][0]).toBe(1);
    expect(result[1][1]).toBe(1);
  });

  test('invalid epsilon은 RangeError', () => {
    expect(() => inverse([[1]], { epsilon: -1 })).toThrow(RangeError);
  });

  test('custom epsilon으로 작은 pivot을 singular로 판정한다', () => {
    expect(inverse([[1e-12]], { epsilon: 1e-9 })).toBeUndefined();
  });
});
