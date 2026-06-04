/**
 * linalg matrix exponential unit test.
 *
 * expInto / exp — empty [] → [], 0x0 zero scalar, diagonal entry별 scalar exp 일치, zero matrix
 *                 → identity, nilpotent [[0,1],[0,0]] → I+A, skew-symmetric rotation generator
 *                 → rotation matrix 근사, scaling-and-squaring trigger 확인,
 *                 maxTerms 부족 → convergence RangeError, invalid maxTerms/tolerance/scalingThreshold,
 *                 non-square / ragged / non-finite input RangeError, expInto out capacity 부족 +
 *                 원자성, expInto aliasing 허용, -0 미보존, options 검증 순서, 옵션 검증 우선.
 */

import { describe, expect, test } from 'vitest';
import { exp } from '../../../src/linalg/exp';
import { expInto } from '../../../src/linalg/exp-into';

function expectMatrixCloseTo(
  actual: readonly (readonly number[])[],
  expected: readonly (readonly number[])[],
  digits: number
): void {
  expect(actual).toHaveLength(expected.length);
  for (let r = 0; r < expected.length; r++) {
    const aRow = actual[r];
    const eRow = expected[r];
    expect(aRow).toHaveLength(eRow.length);
    for (let c = 0; c < eRow.length; c++) {
      expect(aRow[c]).toBeCloseTo(eRow[c], digits);
    }
  }
}

// ---------------------------------------------------------------------------
// expInto
// ---------------------------------------------------------------------------

describe('expInto — matrix exponential (Into)', () => {
  test('빈 matrix []는 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9], [9]];
    const result = expInto(out, []);
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('[[0]]은 [[1]]을 기록한다 (e^0 = 1)', () => {
    const out: number[][] = [[9]];
    expInto(out, [[0]]);
    expect(out[0][0]).toBeCloseTo(1, 12);
  });

  test('[[1]]은 [[e]]를 기록한다', () => {
    const out: number[][] = [[9]];
    expInto(out, [[1]]);
    expect(out[0][0]).toBeCloseTo(Math.E, 12);
  });

  test('diagonal matrix는 diagonal entry별 scalar exp와 일치', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expInto(out, [
      [1, 0],
      [0, 2],
    ]);
    expectMatrixCloseTo(
      out,
      [
        [Math.exp(1), 0],
        [0, Math.exp(2)],
      ],
      10
    );
  });

  test('3x3 diagonal matrix도 entry별 scalar exp와 일치', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
      [9, 9, 9],
    ];
    expInto(out, [
      [0.1, 0, 0],
      [0, -0.5, 0],
      [0, 0, 1.5],
    ]);
    expectMatrixCloseTo(
      out,
      [
        [Math.exp(0.1), 0, 0],
        [0, Math.exp(-0.5), 0],
        [0, 0, Math.exp(1.5)],
      ],
      10
    );
  });

  test('zero matrix는 identity를 기록한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expInto(out, [
      [0, 0],
      [0, 0],
    ]);
    expectMatrixCloseTo(
      out,
      [
        [1, 0],
        [0, 1],
      ],
      12
    );
  });

  test('nilpotent [[0, 1], [0, 0]]는 I + A를 기록한다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expInto(out, [
      [0, 1],
      [0, 0],
    ]);
    expectMatrixCloseTo(
      out,
      [
        [1, 1],
        [0, 1],
      ],
      12
    );
  });

  test('skew-symmetric rotation generator [[0, -θ], [θ, 0]]는 회전 행렬을 근사한다', () => {
    const theta = Math.PI / 4;
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expInto(out, [
      [0, -theta],
      [theta, 0],
    ]);
    expectMatrixCloseTo(
      out,
      [
        [Math.cos(theta), -Math.sin(theta)],
        [Math.sin(theta), Math.cos(theta)],
      ],
      10
    );
  });

  test('큰 norm matrix도 scaling-and-squaring으로 수렴한다', () => {
    // norm = π ≈ 3.14. s = ceil(log2(π / 0.5)) = ceil(log2(6.28)) = 3
    const theta = Math.PI;
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expInto(out, [
      [0, -theta],
      [theta, 0],
    ]);
    expectMatrixCloseTo(
      out,
      [
        [Math.cos(theta), -Math.sin(theta)],
        [Math.sin(theta), Math.cos(theta)],
      ],
      8
    );
  });

  test('maxTerms가 너무 작으면 convergence RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => expInto(out, [[1]], { maxTerms: 2 })).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('maxTerms가 0이면 RangeError', () => {
    expect(() => expInto([[0]], [[0]], { maxTerms: 0 })).toThrow(RangeError);
  });

  test('maxTerms가 음수면 RangeError', () => {
    expect(() => expInto([[0]], [[0]], { maxTerms: -1 })).toThrow(RangeError);
  });

  test('maxTerms가 비정수면 RangeError', () => {
    expect(() => expInto([[0]], [[0]], { maxTerms: 1.5 })).toThrow(RangeError);
  });

  test('maxTerms가 NaN이면 RangeError', () => {
    expect(() => expInto([[0]], [[0]], { maxTerms: Number.NaN })).toThrow(RangeError);
  });

  test('tolerance가 음수면 RangeError', () => {
    expect(() => expInto([[0]], [[0]], { tolerance: -1e-10 })).toThrow(RangeError);
  });

  test('tolerance가 NaN이면 RangeError', () => {
    expect(() => expInto([[0]], [[0]], { tolerance: Number.NaN })).toThrow(RangeError);
  });

  test('tolerance가 Infinity면 RangeError', () => {
    expect(() => expInto([[0]], [[0]], { tolerance: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  test('scalingThreshold가 0이면 RangeError', () => {
    expect(() => expInto([[0]], [[0]], { scalingThreshold: 0 })).toThrow(RangeError);
  });

  test('scalingThreshold가 음수면 RangeError', () => {
    expect(() => expInto([[0]], [[0]], { scalingThreshold: -0.5 })).toThrow(RangeError);
  });

  test('scalingThreshold가 NaN이면 RangeError', () => {
    expect(() => expInto([[0]], [[0]], { scalingThreshold: Number.NaN })).toThrow(RangeError);
  });

  test('scalingThreshold가 Infinity면 RangeError', () => {
    expect(() => expInto([[0]], [[0]], { scalingThreshold: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  test('options 검증이 input 검증보다 먼저 throw한다', () => {
    // matrix가 ragged지만 invalid options 메시지로 먼저 throw
    expect(() => expInto([[0]], [[1, 2], [3]] as unknown as number[][], { maxTerms: -1 })).toThrow(/maxTerms/);
  });

  test('tolerance 0으로 충분히 큰 maxTerms이면 수렴한다 (0인 nilpotent term까지 도달)', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expInto(
      out,
      [
        [0, 1],
        [0, 0],
      ],
      { tolerance: 0 }
    );
    expectMatrixCloseTo(
      out,
      [
        [1, 1],
        [0, 1],
      ],
      12
    );
  });

  test('non-square matrix는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9, 9],
      [9, 9, 9],
    ];
    expect(() =>
      expInto(out, [
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9, 9],
      [9, 9, 9],
    ]);
  });

  test('non-finite entry (NaN/+Infinity/-Infinity)는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expect(() => expInto(out, [[Number.NaN]])).toThrow(RangeError);
    expect(out).toEqual([[9]]);
    expect(() => expInto(out, [[Number.POSITIVE_INFINITY]])).toThrow(RangeError);
    expect(out).toEqual([[9]]);
    expect(() => expInto(out, [[Number.NEGATIVE_INFINITY]])).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('극단적으로 큰 infinity norm은 scaling factor underflow로 RangeError', () => {
    // norm = MAX_VALUE 근방. default scalingThreshold(0.5)에 대해 s >= 1024가 되어
    // 1 / 2^s가 0이 된다. silently 잘못된 결과 대신 RangeError로 차단된다.
    const out: number[][] = [[9]];
    expect(() => expInto(out, [[Number.MAX_VALUE]])).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('scalingThreshold가 비정상적으로 작으면 scaling factor underflow로 RangeError', () => {
    // scalingThreshold = MIN_VALUE이면 s ≈ 1074까지 발산. factor = 0이 되어 RangeError.
    const out: number[][] = [[9]];
    expect(() => expInto(out, [[1]], { scalingThreshold: Number.MIN_VALUE })).toThrow(RangeError);
    expect(out).toEqual([[9]]);
  });

  test('ragged matrix는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() => expInto(out, [[1, 2], [3]] as unknown as number[][])).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('out row 개수 부족은 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9, 9]];
    expect(() =>
      expInto(out, [
        [0, 0],
        [0, 0],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out column capacity 부족은 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9], [9]];
    expect(() =>
      expInto(out, [
        [0, 0],
        [0, 0],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([[9], [9]]);
  });

  test('out === matrix aliasing이 허용된다 (nilpotent)', () => {
    const matrix: number[][] = [
      [0, 1],
      [0, 0],
    ];
    expInto(matrix, matrix);
    expectMatrixCloseTo(
      matrix,
      [
        [1, 1],
        [0, 1],
      ],
      12
    );
  });

  test('out === matrix aliasing이 허용된다 (zero matrix → identity)', () => {
    const matrix: number[][] = [
      [0, 0],
      [0, 0],
    ];
    expInto(matrix, matrix);
    expectMatrixCloseTo(
      matrix,
      [
        [1, 0],
        [0, 1],
      ],
      12
    );
  });

  test('out === matrix aliasing이 허용된다 (rotation)', () => {
    const theta = Math.PI / 6;
    const matrix: number[][] = [
      [0, -theta],
      [theta, 0],
    ];
    expInto(matrix, matrix);
    expectMatrixCloseTo(
      matrix,
      [
        [Math.cos(theta), -Math.sin(theta)],
        [Math.sin(theta), Math.cos(theta)],
      ],
      10
    );
  });

  test('결과 entry에는 -0이 남지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expInto(out, [
      [0, -1],
      [1, 0],
    ]);
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        expect(Object.is(out[r][c], -0)).toBe(false);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// exp
// ---------------------------------------------------------------------------

describe('exp — matrix exponential (companion)', () => {
  test('빈 matrix []는 []을 반환한다', () => {
    expect(exp([])).toEqual([]);
  });

  test('[[0]]은 [[1]]을 반환한다', () => {
    const result = exp([[0]]);
    expect(result[0][0]).toBeCloseTo(1, 12);
  });

  test('zero matrix는 identity를 반환한다', () => {
    expectMatrixCloseTo(
      exp([
        [0, 0],
        [0, 0],
      ]),
      [
        [1, 0],
        [0, 1],
      ],
      12
    );
  });

  test('nilpotent [[0, 1], [0, 0]]는 I + A를 반환한다', () => {
    expectMatrixCloseTo(
      exp([
        [0, 1],
        [0, 0],
      ]),
      [
        [1, 1],
        [0, 1],
      ],
      12
    );
  });

  test('skew-symmetric rotation generator는 회전 행렬과 일치', () => {
    const theta = Math.PI / 3;
    expectMatrixCloseTo(
      exp([
        [0, -theta],
        [theta, 0],
      ]),
      [
        [Math.cos(theta), -Math.sin(theta)],
        [Math.sin(theta), Math.cos(theta)],
      ],
      10
    );
  });

  test('diagonal matrix는 entry별 scalar exp와 일치', () => {
    expectMatrixCloseTo(
      exp([
        [2, 0],
        [0, -1],
      ]),
      [
        [Math.exp(2), 0],
        [0, Math.exp(-1)],
      ],
      8
    );
  });

  test('결과는 input row 참조를 공유하지 않는다', () => {
    const matrix: number[][] = [
      [0, 0],
      [0, 0],
    ];
    const result = exp(matrix);
    expect(result[0]).not.toBe(matrix[0]);
  });

  test('non-square matrix는 RangeError를 던진다', () => {
    expect(() => exp([[1, 2, 3]])).toThrow(RangeError);
  });

  test('non-finite entry (NaN/+Infinity/-Infinity)는 RangeError를 던진다', () => {
    expect(() => exp([[Number.NaN]])).toThrow(RangeError);
    expect(() => exp([[Number.POSITIVE_INFINITY]])).toThrow(RangeError);
    expect(() => exp([[Number.NEGATIVE_INFINITY]])).toThrow(RangeError);
  });

  test('maxTerms 부족 시 RangeError', () => {
    expect(() => exp([[1]], { maxTerms: 2 })).toThrow(RangeError);
  });

  test('invalid scalingThreshold는 RangeError', () => {
    expect(() => exp([[0]], { scalingThreshold: 0 })).toThrow(RangeError);
  });
});
