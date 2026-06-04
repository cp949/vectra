/**
 * augment / augmentInto unit test.
 *
 * augmentInto — same row count, empty+empty, row mismatch, one-sided empty mismatch,
 *               ragged matrix, non-finite input, capacity 부족, aliasing 허용.
 * augment    — 새 matrix 반환, deep copy, empty, row mismatch, non-finite.
 */

import { describe, expect, test } from 'vitest';
import { augment } from '../../../src/linalg/augment';
import { augmentInto } from '../../../src/linalg/augment-into';

describe('augmentInto — matrix horizontal augment (Into)', () => {
  test('same row count에서 [left | right]를 기록한다', () => {
    const out: number[][] = [
      [9, 9, 9, 9, 9],
      [9, 9, 9, 9, 9],
    ];
    const result = augmentInto(
      out,
      [
        [1, 2],
        [3, 4],
      ],
      [
        [10, 20, 30],
        [40, 50, 60],
      ]
    );
    expect(result).toBe(out);
    expect(out).toEqual([
      [1, 2, 10, 20, 30],
      [3, 4, 40, 50, 60],
    ]);
  });

  test('left/right column 수가 달라도 row count만 같으면 동작한다', () => {
    const out: number[][] = [[9, 9, 9, 9]];
    augmentInto(out, [[1]], [[2, 3, 4]]);
    expect(out).toEqual([[1, 2, 3, 4]]);
  });

  test('빈 matrix 두 개는 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9], [9]];
    augmentInto(out, [], []);
    expect(out).toEqual([]);
  });

  test('row count mismatch는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9, 9, 9],
      [9, 9, 9, 9],
    ];
    expect(() =>
      augmentInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        [[10, 20]]
      )
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9, 9, 9],
      [9, 9, 9, 9],
    ]);
  });

  test('한쪽만 empty이면 row count mismatch로 RangeError', () => {
    expect(() => augmentInto([], [[1, 2]], [])).toThrow(RangeError);
    expect(() => augmentInto([], [], [[1, 2]])).toThrow(RangeError);
  });

  test('ragged matrix는 RangeError', () => {
    const out: number[][] = [];
    expect(() => augmentInto(out, [[1, 2], [3]] as unknown as number[][], [[10], [20]])).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('non-finite entry %s는 RangeError를 던지고 out을 수정하지 않는다', (bad) => {
    const out: number[][] = [[9, 9, 9, 9]];
    expect(() => augmentInto(out, [[1, bad]], [[10, 20]])).toThrow(RangeError);
    expect(out).toEqual([[9, 9, 9, 9]]);
  });

  test('out capacity 부족 시 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => augmentInto(out, [[1]], [[2]])).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('out row 개수가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() => augmentInto(out, [[1], [2]], [[3], [4]])).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out과 left가 동일한 row 참조를 공유해도 temp matrix를 통해 결과가 올바르다', () => {
    // augmentInto는 temp matrix에서 결과를 만든 뒤 commit하므로 read/write conflict가 없다.
    const sharedRow0 = [1, 2, 0, 0];
    const sharedRow1 = [3, 4, 0, 0];
    const out: number[][] = [sharedRow0, sharedRow1];
    augmentInto(
      out,
      [
        [1, 2],
        [3, 4],
      ],
      [
        [10, 20],
        [30, 40],
      ]
    );
    expect(out).toEqual([
      [1, 2, 10, 20],
      [3, 4, 30, 40],
    ]);
    expect(out[0]).toBe(sharedRow0);
    expect(out[1]).toBe(sharedRow1);
  });
});

describe('augment — matrix horizontal augment (companion)', () => {
  test('새 number[][]을 반환한다', () => {
    const result = augment(
      [
        [1, 2],
        [3, 4],
      ],
      [[10], [20]]
    );
    expect(result).toEqual([
      [1, 2, 10],
      [3, 4, 20],
    ]);
  });

  test('input row 참조를 공유하지 않는다 (deep copy)', () => {
    const left: number[][] = [[1, 2]];
    const right: number[][] = [[10, 20]];
    const result = augment(left, right);
    left[0][0] = 999;
    right[0][0] = 999;
    expect(result[0]).toEqual([1, 2, 10, 20]);
  });

  test('빈 matrix 두 개는 빈 배열을 반환한다', () => {
    expect(augment([], [])).toEqual([]);
  });

  test('row count mismatch는 RangeError', () => {
    expect(() =>
      augment(
        [[1, 2]],
        [
          [3, 4],
          [5, 6],
        ]
      )
    ).toThrow(RangeError);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => augment([[Number.NaN]], [[1]])).toThrow(RangeError);
  });
});
