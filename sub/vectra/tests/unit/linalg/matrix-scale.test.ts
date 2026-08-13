/**
 * linalg matrix scalar multiplication unit test.
 *
 * scaleMatrix(Into) — finite scalar, zero scalar, non-finite scalar reject,
 *                     matrix non-finite entry reject, overflow result reject,
 *                     out capacity 부족 + 원자성, out === matrix aliasing 허용,
 *                     empty matrix.
 */

import { describe, expect, test } from 'vitest';
import { scaleMatrix } from '../../../src/linalg/scale-matrix';
import { scaleMatrixInto } from '../../../src/linalg/scale-matrix-into';

// ---------------------------------------------------------------------------
// scaleMatrixInto / scaleMatrix
// ---------------------------------------------------------------------------

describe('scaleMatrixInto — matrix scalar multiplication (Into)', () => {
  test('finite scalar로 모든 entry를 곱해 out에 기록한다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
    ];
    const result = scaleMatrixInto(
      out,
      [
        [1, 2, 3],
        [4, 5, 6],
      ],
      2
    );
    expect(result).toBe(out);
    expect(out).toEqual([
      [2, 4, 6],
      [8, 10, 12],
    ]);
  });

  test('scalar 0은 모든 entry를 0으로 만든다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    scaleMatrixInto(
      out,
      [
        [1, 2],
        [3, 4],
      ],
      0
    );
    expect(out).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  test('빈 matrix는 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9]];
    scaleMatrixInto(out, [], 3);
    expect(out).toEqual([]);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'non-finite scalar %s는 RangeError를 던지고 out을 수정하지 않는다',
    (badScalar) => {
      const out: number[][] = [
        [9, 9],
        [9, 9],
      ];
      expect(() =>
        scaleMatrixInto(
          out,
          [
            [1, 2],
            [3, 4],
          ],
          badScalar
        )
      ).toThrow(RangeError);
      expect(out).toEqual([
        [9, 9],
        [9, 9],
      ]);
    }
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'matrix non-finite entry %s는 RangeError를 던지고 out을 수정하지 않는다',
    (bad) => {
      const out: number[][] = [
        [9, 9],
        [9, 9],
      ];
      expect(() =>
        scaleMatrixInto(
          out,
          [
            [1, 2],
            [bad, 4],
          ],
          2
        )
      ).toThrow(RangeError);
      expect(out).toEqual([
        [9, 9],
        [9, 9],
      ]);
    }
  );

  test('overflow(Number.MAX_VALUE * 2 = Infinity)는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => scaleMatrixInto(out, [[Number.MAX_VALUE]], 2)).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => scaleMatrixInto(out, [[1, 2]], 3)).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('out === matrix aliasing이 허용된다 (temp matrix에서 계산 후 commit)', () => {
    const m: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const result = scaleMatrixInto(m, m, 10);
    expect(result).toBe(m);
    expect(m).toEqual([
      [10, 20],
      [30, 40],
    ]);
  });
});

describe('scaleMatrix — matrix scalar multiplication (companion)', () => {
  test('새 number[][] 배열을 반환한다', () => {
    expect(
      scaleMatrix(
        [
          [1, 2],
          [3, 4],
        ],
        3
      )
    ).toEqual([
      [3, 6],
      [9, 12],
    ]);
  });

  test('빈 matrix는 빈 배열을 반환한다', () => {
    expect(scaleMatrix([], 5)).toEqual([]);
  });

  test('non-finite scalar는 RangeError', () => {
    expect(() => scaleMatrix([[1]], Number.NaN)).toThrow(RangeError);
  });

  test('overflow는 RangeError', () => {
    expect(() => scaleMatrix([[Number.MAX_VALUE]], 2)).toThrow(RangeError);
  });
});
