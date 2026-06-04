/**
 * linalg matrix power unit test.
 *
 * powInto / pow — exponent 0(identity) / 1(deep copy) / positive(exponentiation by squaring) /
 *                 negative(inverse path) / large positive, singular negative RangeError,
 *                 non-square RangeError, non-finite entry, ragged matrix, invalid exponent
 *                 (NaN, Infinity, non-integer, non-safe-integer), empty matrix [] handling,
 *                 powInto out capacity 부족 + 원자성, out === matrix aliasing,
 *                 intermediate non-finite RangeError, -0 미보존.
 */

import { describe, expect, test } from 'vitest';
import { pow } from '../../../src/linalg/pow';
import { powInto } from '../../../src/linalg/pow-into';

// ---------------------------------------------------------------------------
// powInto
// ---------------------------------------------------------------------------

describe('powInto — matrix power (Into)', () => {
  test('exponent 0은 identity matrix를 기록한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    const result = powInto(
      out,
      [
        [2, 3],
        [4, 5],
      ],
      0
    );
    expect(result).toBe(out);
    expect(out).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });

  test('exponent 1은 input의 deep copy를 기록한다', () => {
    const matrix: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    powInto(out, matrix, 1);
    expect(out).toEqual([
      [1, 2],
      [3, 4],
    ]);
    // 결과 row가 input row 참조를 공유하지 않는다.
    expect(out[0]).not.toBe(matrix[0]);
  });

  test('exponent 2는 matrix * matrix를 기록한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    powInto(
      out,
      [
        [1, 2],
        [3, 4],
      ],
      2
    );
    // [[1,2],[3,4]]^2 = [[7,10],[15,22]]
    expect(out).toEqual([
      [7, 10],
      [15, 22],
    ]);
  });

  test('exponent 5는 exponentiation by squaring 결과와 일치한다', () => {
    const out: number[][] = [
      [0, 0],
      [0, 0],
    ];
    powInto(
      out,
      [
        [2, 0],
        [0, 3],
      ],
      5
    );
    // diagonal matrix는 entry별 거듭제곱과 일치
    expect(out).toEqual([
      [32, 0],
      [0, 243],
    ]);
  });

  test('exponent -1은 inverse와 일치한다', () => {
    const out: number[][] = [
      [0, 0],
      [0, 0],
    ];
    powInto(
      out,
      [
        [4, 0],
        [0, 2],
      ],
      -1
    );
    expect(out[0][0]).toBeCloseTo(0.25, 12);
    expect(out[0][1]).toBeCloseTo(0, 12);
    expect(out[1][0]).toBeCloseTo(0, 12);
    expect(out[1][1]).toBeCloseTo(0.5, 12);
  });

  test('exponent -2는 inverse^2와 일치한다', () => {
    const out: number[][] = [
      [0, 0],
      [0, 0],
    ];
    powInto(
      out,
      [
        [2, 0],
        [0, 4],
      ],
      -2
    );
    expect(out[0][0]).toBeCloseTo(0.25, 12);
    expect(out[0][1]).toBeCloseTo(0, 12);
    expect(out[1][0]).toBeCloseTo(0, 12);
    expect(out[1][1]).toBeCloseTo(1 / 16, 12);
  });

  test('singular matrix에 음수 exponent는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      powInto(
        out,
        [
          [1, 2],
          [2, 4],
        ],
        -1
      )
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('non-square matrix는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
    ];
    expect(() =>
      powInto(
        out,
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
        2
      )
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9, 9],
      [9, 9, 9],
    ]);
  });

  test('non-finite entry (NaN/+Infinity/-Infinity)는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => powInto(out, [[Number.NaN]], 2)).toThrow(RangeError);
    expect(out).toEqual([[9]]);
    expect(() => powInto(out, [[Number.POSITIVE_INFINITY]], 2)).toThrow(RangeError);
    expect(out).toEqual([[9]]);
    expect(() => powInto(out, [[Number.NEGATIVE_INFINITY]], 2)).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('ragged matrix는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() => powInto(out, [[1, 2], [3]] as unknown as number[][], 2)).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('NaN exponent는 RangeError를 던진다', () => {
    expect(() => powInto([[0]], [[1]], Number.NaN)).toThrow(RangeError);
  });

  test('Infinity exponent는 RangeError를 던진다', () => {
    expect(() => powInto([[0]], [[1]], Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => powInto([[0]], [[1]], Number.NEGATIVE_INFINITY)).toThrow(RangeError);
  });

  test('non-integer exponent는 RangeError를 던진다', () => {
    expect(() => powInto([[0]], [[1]], 1.5)).toThrow(RangeError);
    expect(() => powInto([[0]], [[1]], -0.5)).toThrow(RangeError);
  });

  test('safe integer 범위 밖 exponent는 RangeError를 던진다', () => {
    expect(() => powInto([[0]], [[1]], Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
  });

  test('exponent -0은 identity branch와 일치한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    powInto(
      out,
      [
        [2, 3],
        [4, 5],
      ],
      -0
    );
    expect(out).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });

  test('exponent === MAX_SAFE_INTEGER도 bitwise 절단 없이 처리한다', () => {
    // 1x1 [[1]]은 모든 거듭제곱이 [[1]]이므로 산술 loop가 끝까지 도달하는지만 확인한다.
    const out: number[][] = [[9]];
    powInto(out, [[1]], Number.MAX_SAFE_INTEGER);
    expect(out).toEqual([[1]]);
  });

  test('exponent === -MAX_SAFE_INTEGER도 inverse 후 산술 loop가 도달한다', () => {
    const out: number[][] = [[9]];
    powInto(out, [[1]], -Number.MAX_SAFE_INTEGER);
    expect(out).toEqual([[1]]);
  });

  test('빈 matrix []은 어떤 exponent에서도 []을 기록한다', () => {
    const out: number[][] = [[9]];
    powInto(out, [], 0);
    expect(out).toEqual([]);
    const out2: number[][] = [[9], [9]];
    powInto(out2, [], 3);
    expect(out2).toEqual([]);
    const out3: number[][] = [[9]];
    powInto(out3, [], -5);
    expect(out3).toEqual([]);
  });

  test('out row 개수 부족은 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() =>
      powInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        2
      )
    ).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out column capacity 부족은 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9], [9]];
    expect(() =>
      powInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        2
      )
    ).toThrow(RangeError);
    expect(out).toEqual([[9], [9]]);
  });

  test('out === matrix aliasing이 허용된다 (exponent 0)', () => {
    const matrix: number[][] = [
      [2, 3],
      [4, 5],
    ];
    powInto(matrix, matrix, 0);
    expect(matrix).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });

  test('out === matrix aliasing이 허용된다 (exponent 1)', () => {
    const matrix: number[][] = [
      [2, 3],
      [4, 5],
    ];
    powInto(matrix, matrix, 1);
    expect(matrix).toEqual([
      [2, 3],
      [4, 5],
    ]);
  });

  test('out === matrix aliasing이 허용된다 (exponent 3)', () => {
    const matrix: number[][] = [
      [1, 2],
      [3, 4],
    ];
    powInto(matrix, matrix, 3);
    // [[1,2],[3,4]]^3 = [[37, 54],[81, 118]]
    expect(matrix).toEqual([
      [37, 54],
      [81, 118],
    ]);
  });

  test('out === matrix aliasing이 허용된다 (exponent -1)', () => {
    const matrix: number[][] = [
      [4, 0],
      [0, 2],
    ];
    powInto(matrix, matrix, -1);
    expect(matrix[0][0]).toBeCloseTo(0.25, 12);
    expect(matrix[1][1]).toBeCloseTo(0.5, 12);
  });

  test('intermediate 곱 overflow는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => powInto(out, [[Number.MAX_VALUE]], 3)).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('결과 entry에는 -0이 남지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    // [[-1, 0],[0, -1]]^2 = identity. 중간 계산에서 -0이 생길 수 있다.
    powInto(
      out,
      [
        [-1, 0],
        [0, -1],
      ],
      2
    );
    expect(out).toEqual([
      [1, 0],
      [0, 1],
    ]);
    // toEqual은 +0과 -0을 구분하지 않으므로 Object.is로 명시 검증한다.
    expect(Object.is(out[0][1], -0)).toBe(false);
    expect(Object.is(out[1][0], -0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// pow
// ---------------------------------------------------------------------------

describe('pow — matrix power (companion)', () => {
  test('exponent 0은 identity matrix를 반환한다', () => {
    expect(
      pow(
        [
          [2, 3],
          [4, 5],
        ],
        0
      )
    ).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });

  test('exponent 1은 deep copy를 반환한다', () => {
    const matrix: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const result = pow(matrix, 1);
    expect(result).toEqual(matrix);
    expect(result).not.toBe(matrix);
    expect(result[0]).not.toBe(matrix[0]);
  });

  test('exponent 4는 exponentiation by squaring 결과와 일치한다', () => {
    expect(
      pow(
        [
          [2, 0],
          [0, 3],
        ],
        4
      )
    ).toEqual([
      [16, 0],
      [0, 81],
    ]);
  });

  test('exponent -1은 inverse와 일치한다 (3x3)', () => {
    // [[1,0,0],[0,2,0],[0,0,4]]^-1 = diag(1, 0.5, 0.25)
    const result = pow(
      [
        [1, 0, 0],
        [0, 2, 0],
        [0, 0, 4],
      ],
      -1
    );
    expect(result[0][0]).toBeCloseTo(1, 12);
    expect(result[1][1]).toBeCloseTo(0.5, 12);
    expect(result[2][2]).toBeCloseTo(0.25, 12);
  });

  test('빈 matrix []는 []을 반환한다', () => {
    expect(pow([], 0)).toEqual([]);
    expect(pow([], 7)).toEqual([]);
    expect(pow([], -3)).toEqual([]);
  });

  test('singular matrix에 음수 exponent는 RangeError를 던진다', () => {
    expect(() =>
      pow(
        [
          [1, 2],
          [2, 4],
        ],
        -1
      )
    ).toThrow(RangeError);
  });

  test('non-square matrix는 RangeError를 던진다', () => {
    expect(() => pow([[1, 2, 3]], 2)).toThrow(RangeError);
  });

  test('non-finite entry (NaN/+Infinity/-Infinity)는 RangeError를 던진다', () => {
    expect(() => pow([[Number.NaN]], 2)).toThrow(RangeError);
    expect(() => pow([[Number.POSITIVE_INFINITY]], 2)).toThrow(RangeError);
    expect(() => pow([[Number.NEGATIVE_INFINITY]], 2)).toThrow(RangeError);
  });

  test('invalid exponent는 RangeError를 던진다', () => {
    expect(() => pow([[1]], 0.5)).toThrow(RangeError);
    expect(() => pow([[1]], Number.NaN)).toThrow(RangeError);
    expect(() => pow([[1]], Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  test('intermediate overflow는 RangeError를 던진다', () => {
    expect(() => pow([[Number.MAX_VALUE]], 4)).toThrow(RangeError);
  });
});
