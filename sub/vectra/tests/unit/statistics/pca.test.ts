/**
 * statistics.pca — principal component analysis 결과를 plain object로 반환한다.
 *
 * 검증: centered covariance 기본 component/explained variance 순서, correlation 기반 옵션,
 *   orientation "columns"/"rows" 등가성, mode population/sample denominator, rank-deficient 처리,
 *   variable count 0 / sample count 0 / sample count 1 (sample mode) / sample count 2 (사용 가능),
 *   components mutual orthogonality 및 explainedVariance 합 = covariance trace invariant,
 *   invalid orientation/mode/option, ragged matrix, non-array row, non-finite entry,
 *   누적 sum overflow, useCorrelation zero variance RangeError, sign convention(첫 strict non-zero
 *   loading 양수), signed-zero canonicalize, maxIterations 1 강제 수렴 실패 시 undefined.
 */

import { describe, expect, test } from 'vitest';
import { pca } from '../../../src/statistics/pca';

// ---------------------------------------------------------------------------
// pca — centered covariance 기본
// ---------------------------------------------------------------------------

describe('pca — centered covariance 기본', () => {
  test('2D 선형 데이터의 첫 component는 (1, 1)/sqrt(2) 방향', () => {
    // y = x 위 4점: 첫 component는 (1, 1)/sqrt(2). variance는 모두 첫 component에 집중.
    const data = [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ];
    const result = pca(data);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.rank).toBe(1);
    expect(result.components).toHaveLength(1);
    expect(result.components[0]).toHaveLength(2);
    expect(result.components[0][0]).toBeCloseTo(Math.SQRT1_2, 10);
    expect(result.components[0][1]).toBeCloseTo(Math.SQRT1_2, 10);
    expect(result.explainedVariance).toHaveLength(1);
    expect(result.explainedVarianceRatio).toHaveLength(1);
    expect(result.explainedVarianceRatio[0]).toBeCloseTo(1, 12);
    expect(result.means).toEqual([2.5, 2.5]);
    expect(result.standardDeviations).toBeUndefined();
  });

  test('explainedVariance와 explainedVarianceRatio는 descending 순서', () => {
    // var0=[1,2,3,4], var1=[2,4,3,1]. var0의 variance가 더 큼.
    const data = [
      [1, 2],
      [2, 4],
      [3, 3],
      [4, 1],
    ];
    const result = pca(data);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.explainedVariance.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < result.explainedVariance.length; i++) {
      expect(result.explainedVariance[i - 1]).toBeGreaterThanOrEqual(result.explainedVariance[i]);
    }
    const total = result.explainedVariance.reduce((a, b) => a + b, 0);
    const ratioSum = result.explainedVarianceRatio.reduce((a, b) => a + b, 0);
    expect(ratioSum).toBeCloseTo(1, 12);
    expect(total).toBeGreaterThan(0);
  });

  test('component row는 unit vector', () => {
    const data = [
      [1, 2],
      [2, 4],
      [3, 3],
      [4, 1],
    ];
    const result = pca(data);
    expect(result).toBeDefined();
    if (!result) return;
    for (const row of result.components) {
      const norm = Math.sqrt(row.reduce((s, v) => s + v * v, 0));
      expect(norm).toBeCloseTo(1, 10);
    }
  });

  test('component sign convention: 첫 strict non-zero loading이 양수', () => {
    // 양음 양쪽 가능한 방향. data를 sign flip해도 첫 strict non-zero loading이 양수가 되어야 한다.
    const data = [
      [-1, -1],
      [-2, -2],
      [-3, -3],
      [-4, -4],
    ];
    const result = pca(data);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.components[0][0]).toBeGreaterThan(0);
  });

  test('means는 항상 variable 평균', () => {
    const data = [
      [0, 10],
      [2, 20],
      [4, 30],
    ];
    const result = pca(data);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.means).toEqual([2, 20]);
  });
});

// ---------------------------------------------------------------------------
// pca — useCorrelation
// ---------------------------------------------------------------------------

describe('pca — useCorrelation', () => {
  test('scale 차이가 큰 두 변수에서 component가 scale에 둔감', () => {
    // var0과 var1은 같은 선형 관계지만 var1이 1000배 scale.
    const data = [
      [1, 1000],
      [2, 2000],
      [3, 3000],
      [4, 4000],
    ];
    const result = pca(data, { useCorrelation: true });
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.rank).toBe(1);
    // correlation matrix [[1, 1], [1, 1]] → 첫 component는 (1, 1)/sqrt(2)
    expect(result.components[0][0]).toBeCloseTo(Math.SQRT1_2, 10);
    expect(result.components[0][1]).toBeCloseTo(Math.SQRT1_2, 10);
    expect(result.standardDeviations).toBeDefined();
    expect(result.standardDeviations).toHaveLength(2);
  });

  test('zero variance variable은 RangeError', () => {
    const data = [
      [5, 1],
      [5, 2],
      [5, 3],
    ];
    expect(() => pca(data, { useCorrelation: true })).toThrow(RangeError);
  });

  test('standardDeviations는 useCorrelation: true에서만 채워진다', () => {
    const data = [
      [1, 2],
      [2, 4],
      [3, 6],
    ];
    const withCorr = pca(data, { useCorrelation: true });
    const withoutCorr = pca(data);
    expect(withCorr?.standardDeviations).toBeDefined();
    expect(withoutCorr?.standardDeviations).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// pca — orientation
// ---------------------------------------------------------------------------

describe('pca — orientation', () => {
  test('orientation "rows"는 columns의 transpose와 동일 결과', () => {
    // columns data: 4 observations × 2 variables
    const columnsData = [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ];
    // rows data: 2 variables × 4 observations (transpose)
    const rowsData = [
      [1, 2, 3, 4],
      [1, 2, 3, 4],
    ];
    const colResult = pca(columnsData);
    const rowResult = pca(rowsData, { orientation: 'rows' });
    expect(colResult).toBeDefined();
    expect(rowResult).toBeDefined();
    if (!colResult || !rowResult) return;
    expect(rowResult.rank).toBe(colResult.rank);
    expect(rowResult.means).toEqual(colResult.means);
    expect(rowResult.components).toHaveLength(colResult.components.length);
    for (let i = 0; i < colResult.components.length; i++) {
      for (let j = 0; j < colResult.components[i].length; j++) {
        expect(rowResult.components[i][j]).toBeCloseTo(colResult.components[i][j], 10);
      }
      expect(rowResult.explainedVariance[i]).toBeCloseTo(colResult.explainedVariance[i], 10);
    }
  });
});

// ---------------------------------------------------------------------------
// pca — denominator mode
// ---------------------------------------------------------------------------

describe('pca — denominator mode', () => {
  test('sample mode의 explainedVariance는 population mode의 n/(n-1)배', () => {
    const data = [
      [1, 2],
      [2, 4],
      [3, 6],
      [4, 8],
    ];
    const populationResult = pca(data);
    const sampleResult = pca(data, { mode: 'sample' });
    expect(populationResult).toBeDefined();
    expect(sampleResult).toBeDefined();
    if (!populationResult || !sampleResult) return;
    const factor = 4 / 3; // n / (n - 1)
    expect(sampleResult.explainedVariance[0]).toBeCloseTo(populationResult.explainedVariance[0] * factor, 10);
    // ratio는 정규화되므로 동일.
    expect(sampleResult.explainedVarianceRatio[0]).toBeCloseTo(populationResult.explainedVarianceRatio[0], 10);
  });

  test('sample mode에서 sample count < 2는 RangeError', () => {
    expect(() => pca([[1, 2]], { mode: 'sample' })).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// pca — rank
// ---------------------------------------------------------------------------

describe('pca — invariant', () => {
  test('components 사이는 mutually orthogonal하다 (PSD eigen basis 보장)', () => {
    const data = [
      [1, 2, 3],
      [4, 5, 7],
      [2, 6, 1],
      [8, 1, 5],
      [3, 4, 2],
    ];
    const result = pca(data);
    expect(result).toBeDefined();
    if (!result) return;
    const components = result.components;
    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        let dot = 0;
        for (let k = 0; k < components[i].length; k++) {
          dot += components[i][k] * components[j][k];
        }
        expect(Math.abs(dot)).toBeLessThan(1e-10);
      }
    }
  });

  test('explainedVariance 합은 covariance trace와 같다', () => {
    // mode: "population" default. covariance trace = sum_v var(var_v).
    const data = [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
    ];
    const result = pca(data);
    expect(result).toBeDefined();
    if (!result) return;
    const cols = [
      [1, 3, 5, 7],
      [2, 4, 6, 8],
    ];
    let traceExpected = 0;
    for (const c of cols) {
      const mean = c.reduce((a, b) => a + b, 0) / c.length;
      traceExpected += c.reduce((acc, v) => acc + (v - mean) ** 2, 0) / c.length;
    }
    const sumEv = result.explainedVariance.reduce((a, b) => a + b, 0);
    expect(sumEv).toBeCloseTo(traceExpected, 10);
  });
});

describe('pca — rank', () => {
  test('rank-deficient (collinear) 데이터의 rank는 1', () => {
    // var1 = 2 * var0. covariance matrix는 rank 1.
    const data = [
      [1, 2],
      [2, 4],
      [3, 6],
      [4, 8],
    ];
    const result = pca(data);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.rank).toBe(1);
    expect(result.components).toHaveLength(1);
    expect(result.explainedVariance).toHaveLength(1);
    expect(result.explainedVarianceRatio).toHaveLength(1);
  });

  test('full-rank 데이터의 rank는 variable 수와 같다', () => {
    const data = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ];
    const result = pca(data);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.rank).toBe(2);
    expect(result.components).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// pca — variable / sample count 경계
// ---------------------------------------------------------------------------

describe('pca — variable / sample count 경계', () => {
  test('variable count 0이면 빈 결과', () => {
    const result = pca([]);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.rank).toBe(0);
    expect(result.components).toEqual([]);
    expect(result.explainedVariance).toEqual([]);
    expect(result.explainedVarianceRatio).toEqual([]);
    expect(result.means).toEqual([]);
    expect(result.standardDeviations).toBeUndefined();
  });

  test('orientation "columns"의 [[], []]도 빈 결과', () => {
    const result = pca([[], []]);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.rank).toBe(0);
    expect(result.means).toEqual([]);
  });

  test('variable count > 0인데 sample count 0이면 RangeError', () => {
    // orientation "rows": row=variable, column=observation. [[]] = 1 variable, 0 samples.
    expect(() => pca([[]], { orientation: 'rows' })).toThrow(RangeError);
  });

  test('population mode에서 sample count 1은 허용 (variance 0)', () => {
    const result = pca([[5, 7]]);
    expect(result).toBeDefined();
    if (!result) return;
    // 모든 variance가 0이므로 rank는 0.
    expect(result.rank).toBe(0);
    expect(result.means).toEqual([5, 7]);
  });
});

// ---------------------------------------------------------------------------
// pca — invalid input
// ---------------------------------------------------------------------------

describe('pca — invalid input', () => {
  test('non-array data는 TypeError', () => {
    expect(() => pca(null as unknown as number[][])).toThrow(TypeError);
    expect(() => pca('abc' as unknown as number[][])).toThrow(TypeError);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() =>
      pca([
        [1, 2],
        [3, 4, 5],
      ])
    ).toThrow(RangeError);
  });

  test('non-array row는 TypeError', () => {
    expect(() => pca([[1, 2], null as unknown as number[]])).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() =>
      pca([
        [1, 2],
        [Number.NaN, 4],
      ])
    ).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() =>
      pca([
        [1, 2],
        [Number.POSITIVE_INFINITY, 4],
      ])
    ).toThrow(RangeError);
  });

  test('-Infinity entry는 RangeError', () => {
    expect(() =>
      pca([
        [1, 2],
        [Number.NEGATIVE_INFINITY, 4],
      ])
    ).toThrow(RangeError);
  });

  test('누적 sum overflow는 RangeError', () => {
    expect(() =>
      pca([
        [Number.MAX_VALUE, 1],
        [Number.MAX_VALUE, 2],
      ])
    ).toThrow(RangeError);
  });

  test('invalid orientation은 RangeError', () => {
    expect(() => pca([[1, 2]], { orientation: 'bad' as never })).toThrow(RangeError);
  });

  test('invalid mode는 RangeError', () => {
    expect(() => pca([[1, 2]], { mode: 'bad' as never })).toThrow(RangeError);
  });

  test('invalid maxIterations는 RangeError', () => {
    expect(() => pca([[1, 2]], { maxIterations: 0 })).toThrow(RangeError);
    expect(() => pca([[1, 2]], { maxIterations: -1 })).toThrow(RangeError);
    expect(() => pca([[1, 2]], { maxIterations: 1.5 })).toThrow(RangeError);
    expect(() => pca([[1, 2]], { maxIterations: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  test('invalid tolerance는 RangeError', () => {
    expect(() => pca([[1, 2]], { tolerance: -1 })).toThrow(RangeError);
    expect(() => pca([[1, 2]], { tolerance: Number.NaN })).toThrow(RangeError);
    expect(() => pca([[1, 2]], { tolerance: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  test('invalid epsilon은 RangeError', () => {
    expect(() => pca([[1, 2]], { epsilon: -1 })).toThrow(RangeError);
    expect(() => pca([[1, 2]], { epsilon: Number.NaN })).toThrow(RangeError);
    expect(() => pca([[1, 2]], { epsilon: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// pca — signed-zero canonicalize
// ---------------------------------------------------------------------------

describe('pca — signed-zero canonicalize', () => {
  test('means가 0인 케이스에서 -0이 노출되지 않는다', () => {
    // 평균이 0인 대칭 데이터.
    const data = [
      [-1, -1],
      [1, 1],
    ];
    const result = pca(data);
    expect(result).toBeDefined();
    if (!result) return;
    for (const m of result.means) {
      expect(Object.is(m, -0)).toBe(false);
    }
    for (const row of result.components) {
      for (const v of row) {
        expect(Object.is(v, -0)).toBe(false);
      }
    }
    for (const v of result.explainedVariance) {
      expect(Object.is(v, -0)).toBe(false);
    }
    for (const v of result.explainedVarianceRatio) {
      expect(Object.is(v, -0)).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// pca — 수렴 실패
// ---------------------------------------------------------------------------

describe('pca — 수렴 실패', () => {
  test('maxIterations 1로 off-diagonal이 많은 matrix는 undefined', () => {
    // 4x4 dense covariance가 되는 데이터. Jacobi 1회로는 수렴하기 어렵다.
    // tolerance를 매우 작게 잡아 1회 sweep만으로 max off-diagonal이 tolerance 이하가 되지 않게 한다.
    const data = [
      [1, 2, 3, 4],
      [2, 1, 4, 3],
      [3, 4, 1, 2],
      [4, 3, 2, 1],
      [1, 3, 2, 4],
      [4, 2, 3, 1],
    ];
    const result = pca(data, { maxIterations: 1, tolerance: 1e-15 });
    expect(result).toBeUndefined();
  });
});
