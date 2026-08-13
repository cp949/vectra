/**
 * linalg matrix equality / norm unit test.
 *
 * equals                       — same/different shape, same/different entry, empty matrix,
 *                                +0 vs -0 동등, ragged/non-finite reject.
 * nearEquals                   — default epsilon, custom epsilon 경계값,
 *                                shape mismatch false, invalid epsilon reject,
 *                                ragged/non-finite reject.
 * frobeniusNorm                — 3-4-12 fixture, 빈 matrix, huge magnitude scaling,
 *                                ragged/non-finite reject.
 * columnSumSupremumNorm        — rectangular matrix, 음수 entry 절대값 합, 빈 matrix,
 *                                ragged/non-finite reject, overflow reject.
 * rowSumSupremumNorm           — rectangular matrix, 음수 entry 절대값 합, 빈 matrix,
 *                                ragged/non-finite reject, overflow reject.
 */

import { describe, expect, test } from 'vitest';
import { columnSumSupremumNorm } from '../../../src/linalg/column-sum-supremum-norm';
import { equals } from '../../../src/linalg/equals';
import { frobeniusNorm } from '../../../src/linalg/frobenius-norm';
import { nearEquals } from '../../../src/linalg/near-equals';
import { rowSumSupremumNorm } from '../../../src/linalg/row-sum-supremum-norm';

// ---------------------------------------------------------------------------
// equals
// ---------------------------------------------------------------------------

describe('equals — matrix exact equality', () => {
  test('같은 shape에 모든 entry가 ===이면 true를 반환한다', () => {
    expect(
      equals(
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
        [
          [1, 2, 3],
          [4, 5, 6],
        ]
      )
    ).toBe(true);
  });

  test('동일 instance 비교도 true를 반환한다', () => {
    const m = [
      [1, 2],
      [3, 4],
    ];
    expect(equals(m, m)).toBe(true);
  });

  test('한 entry라도 다르면 false를 반환한다', () => {
    expect(
      equals(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [1, 2],
          [3, 5],
        ]
      )
    ).toBe(false);
  });

  test('row 개수가 다르면 false를 반환한다', () => {
    expect(
      equals(
        [[1, 2]],
        [
          [1, 2],
          [1, 2],
        ]
      )
    ).toBe(false);
  });

  test('column 개수가 다르면 false를 반환한다', () => {
    expect(equals([[1, 2, 3]], [[1, 2]])).toBe(false);
  });

  test('한쪽이 빈 matrix이고 다른 쪽은 아니면 false를 반환한다', () => {
    expect(equals([], [[1]])).toBe(false);
    expect(equals([[1]], [])).toBe(false);
  });

  test('빈 matrix [] 두 개는 true를 반환한다', () => {
    expect(equals([], [])).toBe(true);
  });

  test('+0과 -0은 같다고 본다(=== 정의)', () => {
    expect(equals([[0]], [[-0]])).toBe(true);
    expect(equals([[-0, 0]], [[0, -0]])).toBe(true);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() =>
      equals(
        [[1, 2], [3]],
        [
          [1, 2],
          [3, 4],
        ]
      )
    ).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'a에 non-finite entry %s가 있으면 RangeError',
    (bad) => {
      expect(() => equals([[bad]], [[1]])).toThrow(RangeError);
    }
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'b에 non-finite entry %s가 있으면 RangeError',
    (bad) => {
      expect(() => equals([[1]], [[bad]])).toThrow(RangeError);
    }
  );
});

// ---------------------------------------------------------------------------
// nearEquals
// ---------------------------------------------------------------------------

describe('nearEquals — matrix epsilon equality', () => {
  test('default epsilon(1e-9)으로 동일 entry는 true를 반환한다', () => {
    expect(
      nearEquals(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [1, 2],
          [3, 4],
        ]
      )
    ).toBe(true);
  });

  test('default epsilon으로 차이가 1e-10이면 true를 반환한다', () => {
    expect(nearEquals([[1]], [[1 + 1e-10]])).toBe(true);
  });

  test('default epsilon으로 차이가 1e-8이면 false를 반환한다', () => {
    expect(nearEquals([[1]], [[1 + 1e-8]])).toBe(false);
  });

  test('custom epsilon 경계값은 포함한다(차이 === epsilon)', () => {
    expect(nearEquals([[1]], [[1.5]], 0.5)).toBe(true);
  });

  test('custom epsilon 경계 바로 위는 false를 반환한다', () => {
    expect(nearEquals([[1]], [[1.5 + 1e-9]], 0.5)).toBe(false);
  });

  test('epsilon = 0은 exact equality와 같다(같으면 true)', () => {
    expect(nearEquals([[1, 2]], [[1, 2]], 0)).toBe(true);
  });

  test('epsilon = 0이고 entry가 다르면 false를 반환한다', () => {
    expect(nearEquals([[1]], [[1 + 1e-12]], 0)).toBe(false);
  });

  test('빈 matrix [] 두 개는 true를 반환한다', () => {
    expect(nearEquals([], [])).toBe(true);
  });

  test('shape mismatch는 false를 반환한다', () => {
    expect(nearEquals([[1, 2]], [[1, 2, 3]])).toBe(false);
    expect(nearEquals([[1]], [[1], [1]])).toBe(false);
  });

  test('한쪽이 빈 matrix이고 다른 쪽은 아니면 false를 반환한다', () => {
    expect(nearEquals([], [[1]])).toBe(false);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -1, -1e-300])(
    'invalid epsilon %s는 RangeError',
    (badEpsilon) => {
      expect(() => nearEquals([[1]], [[1]], badEpsilon)).toThrow(RangeError);
    }
  );

  test('ragged matrix는 RangeError', () => {
    expect(() =>
      nearEquals(
        [[1, 2], [3]],
        [
          [1, 2],
          [3, 4],
        ]
      )
    ).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'a에 non-finite entry %s가 있으면 RangeError',
    (bad) => {
      expect(() => nearEquals([[bad]], [[1]])).toThrow(RangeError);
    }
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'b에 non-finite entry %s가 있으면 RangeError',
    (bad) => {
      expect(() => nearEquals([[1]], [[bad]])).toThrow(RangeError);
    }
  );

  test('epsilon은 entry 검증 전에 reject한다', () => {
    expect(() => nearEquals([[Number.NaN]], [[1]], Number.NaN)).toThrow(/epsilon/);
  });
});

// ---------------------------------------------------------------------------
// frobeniusNorm
// ---------------------------------------------------------------------------

describe('frobeniusNorm — sqrt(Σ entry²)', () => {
  test('3-4 단일 row는 sqrt(9 + 16) = 5를 반환한다', () => {
    expect(frobeniusNorm([[3, 4]])).toBe(5);
  });

  test('3-4-12 mixed shape는 sqrt(9 + 16 + 144) = 13을 반환한다', () => {
    expect(frobeniusNorm([[3], [4], [12]])).toBe(13);
  });

  test('2x2 identity는 sqrt(2)를 반환한다', () => {
    expect(
      frobeniusNorm([
        [1, 0],
        [0, 1],
      ])
    ).toBeCloseTo(Math.sqrt(2), 12);
  });

  test('음수 entry는 절대값으로 누적된다', () => {
    expect(frobeniusNorm([[-3, 4]])).toBe(5);
  });

  test('모든 entry가 0이면 0을 반환한다', () => {
    expect(
      frobeniusNorm([
        [0, 0],
        [0, 0],
      ])
    ).toBe(0);
  });

  test('빈 matrix []는 0을 반환한다', () => {
    expect(frobeniusNorm([])).toBe(0);
  });

  test('huge magnitude entry도 max scaling으로 overflow 없이 계산한다', () => {
    const big = 1e200;
    const norm = frobeniusNorm([[3 * big, 4 * big]]);
    expect(norm).toBe(5 * big);
    expect(Number.isFinite(norm)).toBe(true);
  });

  test('Number.MAX_VALUE 단일 entry도 finite로 유지된다', () => {
    expect(frobeniusNorm([[Number.MAX_VALUE]])).toBe(Number.MAX_VALUE);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() => frobeniusNorm([[1, 2], [3]])).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'non-finite entry %s는 RangeError',
    (bad) => {
      expect(() => frobeniusNorm([[bad]])).toThrow(RangeError);
    }
  );
});

// ---------------------------------------------------------------------------
// columnSumSupremumNorm
// ---------------------------------------------------------------------------

describe('columnSumSupremumNorm — max column absolute sum', () => {
  test('rectangular matrix는 column별 |entry| 합의 최대를 반환한다', () => {
    expect(
      columnSumSupremumNorm([
        [1, -7],
        [2, 3],
        [4, -1],
      ])
    ).toBe(11);
  });

  test('음수 entry는 절대값으로 누적된다', () => {
    expect(
      columnSumSupremumNorm([
        [-5, 1],
        [-5, 1],
      ])
    ).toBe(10);
  });

  test('단일 row는 각 column 절대값 자체가 합이고 최대를 반환한다', () => {
    expect(columnSumSupremumNorm([[1, -3, 2]])).toBe(3);
  });

  test('모든 entry가 0이면 0을 반환한다', () => {
    expect(
      columnSumSupremumNorm([
        [0, 0],
        [0, 0],
      ])
    ).toBe(0);
  });

  test('빈 matrix []는 0을 반환한다', () => {
    expect(columnSumSupremumNorm([])).toBe(0);
  });

  test('한 column의 누적이 Infinity이면 RangeError', () => {
    expect(() => columnSumSupremumNorm([[Number.MAX_VALUE], [Number.MAX_VALUE]])).toThrow(RangeError);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() => columnSumSupremumNorm([[1, 2], [3]])).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'non-finite entry %s는 RangeError',
    (bad) => {
      expect(() => columnSumSupremumNorm([[bad]])).toThrow(RangeError);
    }
  );
});

// ---------------------------------------------------------------------------
// rowSumSupremumNorm
// ---------------------------------------------------------------------------

describe('rowSumSupremumNorm — max row absolute sum', () => {
  test('rectangular matrix는 row별 |entry| 합의 최대를 반환한다', () => {
    expect(
      rowSumSupremumNorm([
        [1, 2, 4],
        [-7, 3, -1],
      ])
    ).toBe(11);
  });

  test('음수 entry는 절대값으로 누적된다', () => {
    expect(
      rowSumSupremumNorm([
        [-5, -5],
        [1, 1],
      ])
    ).toBe(10);
  });

  test('단일 column은 각 row 절대값 자체가 합이고 최대를 반환한다', () => {
    expect(rowSumSupremumNorm([[1], [-3], [2]])).toBe(3);
  });

  test('모든 entry가 0이면 0을 반환한다', () => {
    expect(
      rowSumSupremumNorm([
        [0, 0],
        [0, 0],
      ])
    ).toBe(0);
  });

  test('빈 matrix []는 0을 반환한다', () => {
    expect(rowSumSupremumNorm([])).toBe(0);
  });

  test('한 row의 누적이 Infinity이면 RangeError', () => {
    expect(() => rowSumSupremumNorm([[Number.MAX_VALUE, Number.MAX_VALUE]])).toThrow(RangeError);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() => rowSumSupremumNorm([[1, 2], [3]])).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'non-finite entry %s는 RangeError',
    (bad) => {
      expect(() => rowSumSupremumNorm([[bad]])).toThrow(RangeError);
    }
  );
});
