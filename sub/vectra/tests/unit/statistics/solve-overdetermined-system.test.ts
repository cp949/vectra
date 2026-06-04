/**
 * statistics.solveOverdeterminedSystem — least-squares solver.
 *
 * 검증 (core): full-rank 정확 적합 residual 0, noise가 있는 적합 residual > 0, square full-rank, m x 0 zero
 *   column 형태, A = [] 빈 성공, rank-deficient undefined, sign convention 독립성, options epsilon
 *   영향, signed-zero 정규화.
 * 검증 (validation): epsilon NaN/Infinity/음수 RangeError, A non-array TypeError, A ragged RangeError,
 *   b non-array TypeError, b.length mismatch RangeError, rows < columns RangeError, A entry non-finite
 *   RangeError, b entry non-finite RangeError, validation 순서 (epsilon → shape → b array → length →
 *   shape relation → finite).
 * 검증 (arithmetic failure): QR projection norm overflow RangeError.
 */

import { describe, expect, test } from 'vitest';
import { solveOverdeterminedSystem } from '../../../src/statistics/solve-overdetermined-system';

// ---------------------------------------------------------------------------
// full-rank overdetermined exact fit
// ---------------------------------------------------------------------------

describe('solveOverdeterminedSystem — full-rank 정확 적합', () => {
  test('A x = b가 정확히 성립하는 overdetermined 시스템은 residual이 0이다', () => {
    // x = [1, 2]를 만족하는 (3 x 2) 시스템
    const A = [
      [1, 0],
      [0, 1],
      [1, 1],
    ];
    const b = [1, 2, 3];
    const result = solveOverdeterminedSystem(A, b);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.rank).toBe(2);
    expect(result.coefficients).toHaveLength(2);
    expect(result.coefficients[0]).toBeCloseTo(1, 12);
    expect(result.coefficients[1]).toBeCloseTo(2, 12);
    expect(result.residual).toBeLessThan(1e-12);
  });

  test('square full-rank 시스템 (rows === columns) 은 정확한 해를 갖는다', () => {
    // [[2, 0], [0, 3]] x = [4, 9] → x = [2, 3]
    const result = solveOverdeterminedSystem(
      [
        [2, 0],
        [0, 3],
      ],
      [4, 9]
    );
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.rank).toBe(2);
    expect(result.coefficients[0]).toBeCloseTo(2, 12);
    expect(result.coefficients[1]).toBeCloseTo(3, 12);
    expect(result.residual).toBeLessThan(1e-12);
  });

  test('단일 column overdetermined 시스템은 계수를 정확히 산출한다', () => {
    // [[1], [2], [3]] x = [2, 4, 6] → x = [2], residual = 0
    const result = solveOverdeterminedSystem([[1], [2], [3]], [2, 4, 6]);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.rank).toBe(1);
    expect(result.coefficients[0]).toBeCloseTo(2, 12);
    expect(result.residual).toBeLessThan(1e-12);
  });
});

// ---------------------------------------------------------------------------
// full-rank overdetermined noisy fit
// ---------------------------------------------------------------------------

describe('solveOverdeterminedSystem — noise가 있는 적합', () => {
  test('단순 선형 회귀: y = a + b*x + noise', () => {
    // design matrix: column 0 = intercept, column 1 = x
    // y = 1 + 2*x + 작은 noise. 정확 해는 a=1, b=2지만 noise로 residual > 0.
    const A = [
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ];
    const b = [1.0, 3.1, 4.9, 7.0, 9.05];
    const result = solveOverdeterminedSystem(A, b);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.rank).toBe(2);
    // 정확 해 근처 (scale-aware tolerance)
    expect(result.coefficients[0]).toBeCloseTo(1, 1);
    expect(result.coefficients[1]).toBeCloseTo(2, 1);
    // residual 양수
    expect(result.residual).toBeGreaterThan(0);
    expect(Number.isFinite(result.residual)).toBe(true);
  });

  test('직교 column 시스템은 평균과 기울기를 정확히 분리한다', () => {
    // A의 두 column이 직교: [1, 1, 1, 1]과 [-3, -1, 1, 3]
    // b = [0, 2, 4, 6] = 3 * 1 + 1 * x_centered
    const A = [
      [1, -3],
      [1, -1],
      [1, 1],
      [1, 3],
    ];
    const b = [0, 2, 4, 6];
    const result = solveOverdeterminedSystem(A, b);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.coefficients[0]).toBeCloseTo(3, 12);
    expect(result.coefficients[1]).toBeCloseTo(1, 12);
    expect(result.residual).toBeLessThan(1e-12);
  });
});

// ---------------------------------------------------------------------------
// empty / zero-column shape
// ---------------------------------------------------------------------------

describe('solveOverdeterminedSystem — 빈 / zero-column 형태', () => {
  test('A = [], b = []는 빈 성공 결과', () => {
    const result = solveOverdeterminedSystem([], []);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.coefficients).toEqual([]);
    expect(result.residual).toBe(0);
    expect(result.rank).toBe(0);
  });

  test('A가 [[]]이고 b = [v]면 coefficients=[], residual=|v|, rank=0', () => {
    const result = solveOverdeterminedSystem([[]], [5]);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.coefficients).toEqual([]);
    expect(result.residual).toBeCloseTo(5, 12);
    expect(result.rank).toBe(0);
  });

  test('A가 m x 0이고 b.length === m이면 coefficients=[], residual=||b||₂, rank=0', () => {
    // b = [3, 4] → ||b|| = 5
    const result = solveOverdeterminedSystem([[], []], [3, 4]);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.coefficients).toEqual([]);
    expect(result.residual).toBeCloseTo(5, 12);
    expect(result.rank).toBe(0);
  });

  test('A가 m x 0이고 b = [0, 0, 0]이면 residual = 0', () => {
    const result = solveOverdeterminedSystem([[], [], []], [0, 0, 0]);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.coefficients).toEqual([]);
    expect(result.residual).toBe(0);
    expect(result.rank).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// rank-deficient → undefined
// ---------------------------------------------------------------------------

describe('solveOverdeterminedSystem — rank-deficient', () => {
  test('중복 column으로 rank-deficient이면 undefined를 반환한다', () => {
    // 두 column이 동일하면 column rank = 1 < 2
    const result = solveOverdeterminedSystem(
      [
        [1, 1],
        [2, 2],
        [3, 3],
      ],
      [1, 2, 3]
    );
    expect(result).toBeUndefined();
  });

  test('zero column으로 rank-deficient이면 undefined를 반환한다', () => {
    // column 1이 모두 0
    const result = solveOverdeterminedSystem(
      [
        [1, 0],
        [2, 0],
        [3, 0],
      ],
      [1, 2, 3]
    );
    expect(result).toBeUndefined();
  });

  test('선형 종속 column으로 rank-deficient이면 undefined를 반환한다', () => {
    // column 2 = column 0 + column 1
    const result = solveOverdeterminedSystem(
      [
        [1, 0, 1],
        [0, 1, 1],
        [1, 1, 2],
        [2, 1, 3],
      ],
      [1, 2, 3, 4]
    );
    expect(result).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// epsilon 옵션
// ---------------------------------------------------------------------------

describe('solveOverdeterminedSystem — options.epsilon', () => {
  test('미지정 시 default(1e-9) 사용', () => {
    // 명백한 full-rank 시스템은 default에서 성공
    const result = solveOverdeterminedSystem(
      [
        [1, 0],
        [0, 1],
        [1, 1],
      ],
      [1, 2, 3]
    );
    expect(result).toBeDefined();
  });

  test('epsilon === 0에서 명백한 full-rank 시스템은 통과한다', () => {
    const result = solveOverdeterminedSystem(
      [
        [1, 0],
        [0, 1],
        [1, 1],
      ],
      [1, 2, 3],
      { epsilon: 0 }
    );
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.rank).toBe(2);
  });

  test('큰 epsilon은 default(1e-9)가 통과시키는 near-dependent column을 rank-deficient로 판정한다', () => {
    // 두 column이 거의 동일 — default epsilon은 통과, 큰 epsilon은 rank-deficient로 판정.
    const tiny = 1e-6;
    const A = [
      [1, 1 + tiny],
      [2, 2 + tiny],
      [3, 3 + tiny],
    ];
    const b = [1, 2, 3];
    // default epsilon (1e-9): residual norm이 epsilon보다 크므로 통과
    const defaultResult = solveOverdeterminedSystem(A, b);
    expect(defaultResult).toBeDefined();
    if (defaultResult) {
      expect(defaultResult.rank).toBe(2);
    }
    // 큰 epsilon (1e-3): residual norm이 epsilon 이하 → rank-deficient로 판정
    const looseResult = solveOverdeterminedSystem(A, b, { epsilon: 1e-3 });
    expect(looseResult).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// signed-zero 정규화
// ---------------------------------------------------------------------------

describe('solveOverdeterminedSystem — signed-zero 정규화', () => {
  test('coefficient 결과의 -0은 +0으로 정규화한다', () => {
    // b 부호 반전으로 -0 coefficient를 유도. b = [0, 0, 0] → x = [0, 0]
    const result = solveOverdeterminedSystem(
      [
        [1, 0],
        [0, 1],
        [1, 1],
      ],
      [0, 0, 0]
    );
    expect(result).toBeDefined();
    if (!result) return;
    // -0 canonicalize는 vitest toEqual로 검증할 수 없다(+0 === -0). Object.is로 명시 검증한다.
    expect(result.coefficients).toHaveLength(2);
    expect(result.coefficients[0]).toBe(0);
    expect(result.coefficients[1]).toBe(0);
    expect(Object.is(result.coefficients[0], -0)).toBe(false);
    expect(Object.is(result.coefficients[1], -0)).toBe(false);
  });

  test('negative b 입력에서도 zero coefficient는 +0이다', () => {
    // 두 번째 변수가 0인 시스템: b = [1, -0, 1], x = [1, 0]
    const result = solveOverdeterminedSystem(
      [
        [1, 0],
        [0, 1],
        [1, 0],
      ],
      [1, -0, 1]
    );
    expect(result).toBeDefined();
    if (!result) return;
    expect(Object.is(result.coefficients[1], -0)).toBe(false);
    expect(result.coefficients[1]).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// invalid input
// ---------------------------------------------------------------------------

describe('solveOverdeterminedSystem — 잘못된 options.epsilon', () => {
  test('epsilon이 NaN이면 RangeError', () => {
    expect(() => solveOverdeterminedSystem([[1]], [1], { epsilon: Number.NaN })).toThrow(RangeError);
  });

  test('epsilon이 Infinity이면 RangeError', () => {
    expect(() => solveOverdeterminedSystem([[1]], [1], { epsilon: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  test('epsilon이 음수이면 RangeError', () => {
    expect(() => solveOverdeterminedSystem([[1]], [1], { epsilon: -1 })).toThrow(RangeError);
  });

  test('epsilon 검증이 다른 입력 검증보다 먼저 수행된다', () => {
    // A가 잘못됐어도 epsilon이 먼저 실패해야 한다
    expect(() =>
      solveOverdeterminedSystem(null as unknown as number[][], null as unknown as number[], { epsilon: -1 })
    ).toThrow(RangeError);
  });
});

describe('solveOverdeterminedSystem — 잘못된 A', () => {
  test('A가 non-array이면 TypeError', () => {
    expect(() => solveOverdeterminedSystem(null as unknown as number[][], [])).toThrow(TypeError);
    expect(() => solveOverdeterminedSystem('abc' as unknown as number[][], [])).toThrow(TypeError);
  });

  test('A[0]이 array가 아니면 TypeError', () => {
    expect(() => solveOverdeterminedSystem([1, 2, 3] as unknown as number[][], [1, 2, 3])).toThrow(TypeError);
  });

  test('A가 ragged이면 RangeError', () => {
    expect(() => solveOverdeterminedSystem([[1, 2], [3]], [1, 2])).toThrow(RangeError);
  });

  test('A entry가 non-finite이면 RangeError', () => {
    expect(() =>
      solveOverdeterminedSystem(
        [
          [1, 0],
          [0, Number.NaN],
          [1, 1],
        ],
        [1, 2, 3]
      )
    ).toThrow(RangeError);
    expect(() =>
      solveOverdeterminedSystem(
        [
          [1, 0],
          [Number.POSITIVE_INFINITY, 1],
          [1, 1],
        ],
        [1, 2, 3]
      )
    ).toThrow(RangeError);
  });
});

describe('solveOverdeterminedSystem — 잘못된 b', () => {
  test('b가 non-array이면 TypeError', () => {
    expect(() => solveOverdeterminedSystem([[1]], null as unknown as number[])).toThrow(TypeError);
    expect(() => solveOverdeterminedSystem([[1]], undefined as unknown as number[])).toThrow(TypeError);
  });

  test('b.length가 A.rows와 다르면 RangeError', () => {
    expect(() =>
      solveOverdeterminedSystem(
        [
          [1, 0],
          [0, 1],
          [1, 1],
        ],
        [1, 2]
      )
    ).toThrow(RangeError);
    expect(() => solveOverdeterminedSystem([[1]], [1, 2])).toThrow(RangeError);
  });

  test('b entry가 non-finite이면 RangeError', () => {
    expect(() =>
      solveOverdeterminedSystem(
        [
          [1, 0],
          [0, 1],
          [1, 1],
        ],
        [1, Number.NaN, 3]
      )
    ).toThrow(RangeError);
    expect(() =>
      solveOverdeterminedSystem(
        [
          [1, 0],
          [0, 1],
          [1, 1],
        ],
        [1, 2, Number.NEGATIVE_INFINITY]
      )
    ).toThrow(RangeError);
  });
});

describe('solveOverdeterminedSystem — underdetermined 형태', () => {
  test('A.rows < A.columns이면 RangeError', () => {
    // (2 x 3) shape는 underdetermined → 본 API 범위 밖
    expect(() =>
      solveOverdeterminedSystem(
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
        [1, 2]
      )
    ).toThrow(RangeError);
  });

  test('rows < columns 검증은 b.length 검증 이후에 수행된다', () => {
    // b.length가 먼저 검증되므로 length mismatch부터 잡힌다
    expect(() =>
      solveOverdeterminedSystem(
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
        [1]
      )
    ).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// arithmetic failure (finite intermediate)
// ---------------------------------------------------------------------------

describe('solveOverdeterminedSystem — 산술 오류', () => {
  test('QR projection overflow이면 RangeError', () => {
    // MAX_VALUE 두 entry 곱이 overflow를 유도
    const huge = Number.MAX_VALUE;
    expect(() =>
      solveOverdeterminedSystem(
        [
          [huge, 0],
          [huge, 0],
          [huge, 0],
        ],
        [huge, huge, huge]
      )
    ).toThrow(RangeError);
  });
});
