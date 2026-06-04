/**
 * linalg augmented triangular substitution unit test.
 *
 * forwardSubstituteAugmentedMatrix / backwardSubstituteAugmentedMatrix
 *   — `[T | b]` shape 처리, columns !== rows + 1 → RangeError.
 *   — empty `[]` 입력은 columns === rows + 1 위반으로 RangeError.
 *   — 비-삼각 영역 non-zero → RangeError.
 *   — zero diagonal within epsilon → undefined.
 *   — non-finite entry / invalid epsilon → RangeError.
 *
 * 공통: solution에 -0이 남지 않는다. 결과는 새 number[] 인스턴스다.
 */

import { describe, expect, test } from 'vitest';
import { backwardSubstituteAugmentedMatrix } from '../../../src/linalg/backward-substitute-augmented-matrix';
import { forwardSubstituteAugmentedMatrix } from '../../../src/linalg/forward-substitute-augmented-matrix';

describe('forwardSubstituteAugmentedMatrix — 정상 입력', () => {
  test('[L | b] 3x4 augmented matrix를 forward substitution한다', () => {
    // L = [[2, 0, 0], [3, 1, 0], [1, -1, 4]], b = [4, 5, 6]
    const result = forwardSubstituteAugmentedMatrix([
      [2, 0, 0, 4],
      [3, 1, 0, 5],
      [1, -1, 4, 6],
    ]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result[0]).toBeCloseTo(2, 12);
    expect(result[1]).toBeCloseTo(-1, 12);
    expect(result[2]).toBeCloseTo(0.75, 12);
  });

  test('1x2 augmented `[[a, b]]`는 [b/a]를 반환한다', () => {
    expect(forwardSubstituteAugmentedMatrix([[2, 10]])).toEqual([5]);
  });

  test('solution에 -0이 남지 않는다', () => {
    const result = forwardSubstituteAugmentedMatrix([
      [2, 0, 0],
      [-3, 1, 0],
    ]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(Object.is(result[0], -0)).toBe(false);
    expect(Object.is(result[1], -0)).toBe(false);
  });
});

describe('forwardSubstituteAugmentedMatrix — singular', () => {
  test('diagonal abs가 epsilon 이하이면 undefined를 반환한다', () => {
    expect(
      forwardSubstituteAugmentedMatrix([
        [2, 0, 4],
        [3, 0, 5],
      ])
    ).toBeUndefined();
  });
});

describe('forwardSubstituteAugmentedMatrix — validation', () => {
  test('columns !== rows + 1이면 RangeError를 던진다', () => {
    expect(() =>
      forwardSubstituteAugmentedMatrix([
        [1, 0, 0, 4],
        [2, 3, 0, 5],
      ])
    ).toThrow(RangeError);
  });

  test('빈 입력 `[]`은 columns === rows + 1 위반으로 RangeError를 던진다', () => {
    expect(() => forwardSubstituteAugmentedMatrix([])).toThrow(RangeError);
  });

  test('one-sided zero shape `[[]]`은 RangeError를 던진다', () => {
    expect(() => forwardSubstituteAugmentedMatrix([[]])).toThrow(RangeError);
  });

  test('upper coefficient 영역에 epsilon보다 큰 non-zero가 있으면 RangeError를 던진다', () => {
    expect(() =>
      forwardSubstituteAugmentedMatrix([
        [1, 5, 4],
        [2, 3, 5],
      ])
    ).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY])('non-finite entry %s는 RangeError를 던진다', (bad) => {
    expect(() =>
      forwardSubstituteAugmentedMatrix([
        [1, 0, 4],
        [bad, 1, 5],
      ])
    ).toThrow(RangeError);
  });

  test.each([Number.NaN, -1])('invalid epsilon %s는 RangeError를 던진다', (bad) => {
    expect(() => forwardSubstituteAugmentedMatrix([[1, 4]], { epsilon: bad })).toThrow(RangeError);
  });

  test('invalid epsilon은 input 검증 전에 던진다', () => {
    expect(() => forwardSubstituteAugmentedMatrix([[1, 4], [0]], { epsilon: -1 })).toThrow(/epsilon/);
  });
});

describe('backwardSubstituteAugmentedMatrix — 정상 입력', () => {
  test('[U | b] 3x4 augmented matrix를 backward substitution한다', () => {
    // U = [[2, 1, -1], [0, 1, 2], [0, 0, 4]], b = [3, 4, 8]
    const result = backwardSubstituteAugmentedMatrix([
      [2, 1, -1, 3],
      [0, 1, 2, 4],
      [0, 0, 4, 8],
    ]);
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result[0]).toBeCloseTo(2.5, 12);
    expect(result[1]).toBeCloseTo(0, 12);
    expect(result[2]).toBeCloseTo(2, 12);
  });

  test('1x2 augmented `[[a, b]]`는 [b/a]를 반환한다', () => {
    expect(backwardSubstituteAugmentedMatrix([[2, 10]])).toEqual([5]);
  });
});

describe('backwardSubstituteAugmentedMatrix — singular', () => {
  test('diagonal abs가 epsilon 이하이면 undefined를 반환한다', () => {
    expect(
      backwardSubstituteAugmentedMatrix([
        [2, 3, 4],
        [0, 0, 5],
      ])
    ).toBeUndefined();
  });
});

describe('backwardSubstituteAugmentedMatrix — validation', () => {
  test('columns !== rows + 1이면 RangeError를 던진다', () => {
    expect(() =>
      backwardSubstituteAugmentedMatrix([
        [1, 2, 3, 4],
        [0, 3, 4, 5],
      ])
    ).toThrow(RangeError);
  });

  test('빈 입력 `[]`은 columns === rows + 1 위반으로 RangeError를 던진다', () => {
    expect(() => backwardSubstituteAugmentedMatrix([])).toThrow(RangeError);
  });

  test('lower coefficient 영역에 epsilon보다 큰 non-zero가 있으면 RangeError를 던진다', () => {
    expect(() =>
      backwardSubstituteAugmentedMatrix([
        [1, 2, 4],
        [5, 3, 5],
      ])
    ).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.NEGATIVE_INFINITY])('non-finite entry %s는 RangeError를 던진다', (bad) => {
    expect(() =>
      backwardSubstituteAugmentedMatrix([
        [1, bad, 4],
        [0, 1, 5],
      ])
    ).toThrow(RangeError);
  });

  test.each([Number.NaN, -1])('invalid epsilon %s는 RangeError를 던진다', (bad) => {
    expect(() => backwardSubstituteAugmentedMatrix([[1, 4]], { epsilon: bad })).toThrow(RangeError);
  });
});
