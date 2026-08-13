/**
 * extractSolutionFromRrefAugmentedMatrix unit test.
 *
 * unique / underdetermined / inconsistent / malformed RREF / validation / custom epsilon 분기를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { extractSolutionFromRrefAugmentedMatrix } from '../../../src/linalg/extract-solution-from-rref-augmented-matrix';

describe('extractSolutionFromRrefAugmentedMatrix — unique', () => {
  test('square identity RREF에서 RHS를 그대로 solution으로 반환한다', () => {
    const result = extractSolutionFromRrefAugmentedMatrix([
      [1, 0, 0, 3],
      [0, 1, 0, -2],
      [0, 0, 1, 5],
    ]);
    expect(result.type).toBe('unique');
    if (result.type !== 'unique') return;
    expect(result.solution).toEqual([3, -2, 5]);
  });

  test('tall augmented matrix(rows > coefficientColumns)도 pivot count가 unknown count와 같으면 unique다', () => {
    const result = extractSolutionFromRrefAugmentedMatrix([
      [1, 0, 7],
      [0, 1, 11],
      [0, 0, 0],
    ]);
    expect(result.type).toBe('unique');
    if (result.type !== 'unique') return;
    expect(result.solution).toEqual([7, 11]);
  });

  test('coefficient columns가 0이고 RHS가 모두 0이면 빈 solution을 반환한다', () => {
    const result = extractSolutionFromRrefAugmentedMatrix([[0], [0]]);
    expect(result.type).toBe('unique');
    if (result.type !== 'unique') return;
    expect(result.solution).toEqual([]);
  });

  test('single row, single coefficient column unique RREF', () => {
    const result = extractSolutionFromRrefAugmentedMatrix([[1, 4]]);
    expect(result.type).toBe('unique');
    if (result.type !== 'unique') return;
    expect(result.solution).toEqual([4]);
  });

  test('solution에 -0이 남지 않는다', () => {
    const result = extractSolutionFromRrefAugmentedMatrix([
      [1, 0, -0],
      [0, 1, 5],
    ]);
    expect(result.type).toBe('unique');
    if (result.type !== 'unique') return;
    expect(result.solution[0]).toBe(0);
    expect(Object.is(result.solution[0], -0)).toBe(false);
    expect(result.solution[1]).toBe(5);
  });

  test('새 number[] 인스턴스를 반환해 input row 참조를 공유하지 않는다', () => {
    const rref = [
      [1, 0, 9],
      [0, 1, 8],
    ];
    const result = extractSolutionFromRrefAugmentedMatrix(rref);
    expect(result.type).toBe('unique');
    if (result.type !== 'unique') return;
    rref[0][2] = 999;
    expect(result.solution).toEqual([9, 8]);
  });
});

describe('extractSolutionFromRrefAugmentedMatrix — underdetermined', () => {
  test('free column이 있으면 pivotColumns와 rref deep copy를 반환한다', () => {
    const input = [
      [1, 0, 2, 3],
      [0, 1, 4, 5],
    ];
    const result = extractSolutionFromRrefAugmentedMatrix(input);
    expect(result.type).toBe('underdetermined');
    if (result.type !== 'underdetermined') return;
    expect(result.pivotColumns).toEqual([0, 1]);
    expect(result.rref).toEqual([
      [1, 0, 2, 3],
      [0, 1, 4, 5],
    ]);
    input[0][2] = 999;
    expect(result.rref[0][2]).toBe(2);
  });

  test('all-zero row가 섞여 있어도 pivotColumns는 ascending 순서로 수집된다', () => {
    const result = extractSolutionFromRrefAugmentedMatrix([
      [1, 2, 0, 0, 7],
      [0, 0, 1, 5, 8],
      [0, 0, 0, 0, 0],
    ]);
    expect(result.type).toBe('underdetermined');
    if (result.type !== 'underdetermined') return;
    expect(result.pivotColumns).toEqual([0, 2]);
  });

  test('copied rref에 -0이 남지 않는다', () => {
    const result = extractSolutionFromRrefAugmentedMatrix([
      [1, -0, 2, 0],
      [0, 0, 0, -0],
    ]);
    expect(result.type).toBe('underdetermined');
    if (result.type !== 'underdetermined') return;
    for (const row of result.rref) {
      for (const v of row) {
        expect(Object.is(v, -0)).toBe(false);
      }
    }
  });
});

describe('extractSolutionFromRrefAugmentedMatrix — inconsistent', () => {
  test('coefficient zero인데 RHS abs > epsilon인 row가 있으면 inconsistent다', () => {
    const result = extractSolutionFromRrefAugmentedMatrix([
      [1, 0, 2],
      [0, 0, 5],
    ]);
    expect(result.type).toBe('inconsistent');
    if (result.type !== 'inconsistent') return;
    expect(result.rref).toEqual([
      [1, 0, 2],
      [0, 0, 5],
    ]);
  });

  test('inconsistent row가 존재하면 free column이 있어도 inconsistent를 우선한다', () => {
    const result = extractSolutionFromRrefAugmentedMatrix([
      [1, 2, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 3],
    ]);
    expect(result.type).toBe('inconsistent');
  });

  test('inconsistent 분기도 deep copy된 rref를 반환한다', () => {
    const input = [
      [1, 0, 2],
      [0, 0, 5],
    ];
    const result = extractSolutionFromRrefAugmentedMatrix(input);
    expect(result.type).toBe('inconsistent');
    if (result.type !== 'inconsistent') return;
    input[1][2] = 999;
    expect(result.rref[1][2]).toBe(5);
  });

  test('inconsistent rref copy에 -0이 남지 않는다', () => {
    const result = extractSolutionFromRrefAugmentedMatrix([
      [1, -0, 2],
      [-0, 0, 5],
    ]);
    expect(result.type).toBe('inconsistent');
    if (result.type !== 'inconsistent') return;
    for (const row of result.rref) {
      for (const v of row) {
        expect(Object.is(v, -0)).toBe(false);
      }
    }
  });
});

describe('extractSolutionFromRrefAugmentedMatrix — malformed RREF', () => {
  test('두 row가 같은 pivot column을 가지면 RangeError를 던진다', () => {
    expect(() =>
      extractSolutionFromRrefAugmentedMatrix([
        [1, 0, 5],
        [1, 0, 6],
      ])
    ).toThrow(RangeError);
  });
});

describe('extractSolutionFromRrefAugmentedMatrix — validation', () => {
  test('빈 입력 `[]`은 columns === 0이므로 RangeError를 던진다', () => {
    expect(() => extractSolutionFromRrefAugmentedMatrix([])).toThrow(RangeError);
  });

  test('one-sided zero shape `[[]]`은 RangeError를 던진다', () => {
    expect(() => extractSolutionFromRrefAugmentedMatrix([[]])).toThrow(RangeError);
  });

  test('ragged row는 RangeError를 던진다', () => {
    expect(() =>
      extractSolutionFromRrefAugmentedMatrix([
        [1, 0, 2],
        [0, 1],
      ])
    ).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'non-finite entry %s는 RangeError를 던진다',
    (bad) => {
      expect(() => extractSolutionFromRrefAugmentedMatrix([[1, 0, bad]])).toThrow(RangeError);
    }
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, -1])(
    'invalid epsilon %s는 다른 input보다 먼저 RangeError를 던진다',
    (bad) => {
      expect(() => extractSolutionFromRrefAugmentedMatrix([[1, 0, 2]], { epsilon: bad })).toThrow(RangeError);
    }
  );

  test('invalid epsilon은 rref input 검증 전에 먼저 던진다', () => {
    // rref가 ragged여도 epsilon 검증이 우선이라 epsilon 메시지로 throw한다.
    expect(() =>
      extractSolutionFromRrefAugmentedMatrix(
        [
          [1, 0, 2],
          [0, 1],
        ],
        { epsilon: -1 }
      )
    ).toThrow(/epsilon/);
  });
});

describe('extractSolutionFromRrefAugmentedMatrix — custom epsilon', () => {
  test('epsilon 이하의 작은 noise는 pivot 후보로 보지 않는다', () => {
    // row 1의 coefficient는 모두 1e-12 (default epsilon 1e-9 이하)라 inconsistent.
    const result = extractSolutionFromRrefAugmentedMatrix([
      [1, 0, 2],
      [1e-12, 1e-12, 7],
    ]);
    expect(result.type).toBe('inconsistent');
  });

  test('epsilon = 0이면 작은 값도 pivot/RHS 비교에 그대로 사용한다', () => {
    // epsilon = 0에서는 RHS 1e-15도 nonzero로 본다.
    // row 1의 coefficient는 모두 0이고 RHS abs = 1e-15 > 0 → inconsistent.
    const result = extractSolutionFromRrefAugmentedMatrix(
      [
        [1, 0, 2],
        [0, 0, 1e-15],
      ],
      { epsilon: 0 }
    );
    expect(result.type).toBe('inconsistent');
  });

  test('epsilon이 큰 값이면 RHS의 nonzero도 zero로 보고 unique를 반환할 수 있다', () => {
    // coefficient 1은 1e-3 epsilon보다 크므로 pivot column으로 인식한다.
    // 두 번째 row는 coefficient도 RHS도 모두 1e-6 (epsilon 이하) → zero row로 본다.
    const result = extractSolutionFromRrefAugmentedMatrix(
      [
        [1, 0, 4],
        [0, 1e-6, 1e-6],
      ],
      { epsilon: 1e-3 }
    );
    expect(result.type).toBe('underdetermined');
    if (result.type !== 'underdetermined') return;
    expect(result.pivotColumns).toEqual([0]);
  });
});
