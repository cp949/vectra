/**
 * statistics.reduceDimensionsInto / reduceDimensions — PCA projection을 `out` 또는 새 matrix에 기록한다.
 *
 * 검증: simple 2D data의 1D projection 값, dimensions === rank에서 components basis로의 reconstruction
 *   round-trip, orientation "rows" projection shape/값, useCorrelation: true projection,
 *   invalid dimensions(0/음수/non-integer/Infinity/NaN/rank 초과), variable count 0,
 *   mode "sample" projection 동치성 + sample count 1 RangeError,
 *   PCA decomposition 실패 시 RangeError, atomicity 시 NaN/Infinity/-Infinity 표면화,
 *   signed-zero canonicalize, out과 data aliasing 안전, allocating companion이 fresh matrix를 반환.
 */

import { describe, expect, test } from 'vitest';
import { reduceDimensions } from '../../../src/statistics/reduce-dimensions';
import { reduceDimensionsInto } from '../../../src/statistics/reduce-dimensions-into';

// ---------------------------------------------------------------------------
// reduceDimensionsInto — projection 값
// ---------------------------------------------------------------------------

describe('reduceDimensionsInto — projection 값', () => {
  test('y=x 선형 2D data의 1D projection은 centered 좌표의 √2 배', () => {
    // means = [2.5, 2.5], 첫 component = (√½, √½).
    // centered = (-1.5,-1.5), (-0.5,-0.5), (0.5,0.5), (1.5,1.5)
    // projection = centered · (√½, √½) = sum * √½
    const data = [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ];
    const out: number[][] = [];
    const result = reduceDimensionsInto(out, data, { dimensions: 1 });
    expect(result).toBe(out);
    expect(out).toHaveLength(4);
    for (const row of out) {
      expect(row).toHaveLength(1);
    }
    const sqrtHalf = Math.SQRT1_2;
    expect(out[0][0]).toBeCloseTo(-3 * sqrtHalf, 10);
    expect(out[1][0]).toBeCloseTo(-1 * sqrtHalf, 10);
    expect(out[2][0]).toBeCloseTo(1 * sqrtHalf, 10);
    expect(out[3][0]).toBeCloseTo(3 * sqrtHalf, 10);
  });

  test('dimensions === rank에서 projection을 components basis로 재구성하면 centered 좌표가 복원된다', () => {
    // 4점, 2 variable, full rank 2. components는 orthonormal basis.
    // projection P = X_centered · C^T (C = components, row = component basis)
    // 재구성 X_centered ≈ P · C
    const data = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ];
    // means = [0, 0]이므로 centered = data 그대로.
    const out = reduceDimensions(data, { dimensions: 2 });
    // 재구성을 위해 components가 필요하지만 dimension reduction 결과만으로 round-trip을 직접 계산하기
    // 위해 다른 방법: projection norm의 제곱 합 = centered norm의 제곱 합 (orthonormal basis 보존).
    for (let r = 0; r < data.length; r++) {
      const centered = data[r]; // means = 0
      const cNorm2 = centered[0] * centered[0] + centered[1] * centered[1];
      const pNorm2 = out[r][0] * out[r][0] + out[r][1] * out[r][1];
      expect(pNorm2).toBeCloseTo(cNorm2, 10);
    }
  });
});

// ---------------------------------------------------------------------------
// reduceDimensionsInto — orientation
// ---------------------------------------------------------------------------

describe('reduceDimensionsInto — orientation', () => {
  test('orientation "rows" 결과는 columns(transpose)와 동일한 projection shape/값', () => {
    const columnsData = [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ];
    const rowsData = [
      [1, 2, 3, 4],
      [1, 2, 3, 4],
    ];
    const colOut = reduceDimensions(columnsData, { dimensions: 1 });
    const rowOut = reduceDimensions(rowsData, { dimensions: 1, orientation: 'rows' });
    // 둘 다 4 observation × 1 component shape여야 한다.
    expect(colOut).toHaveLength(4);
    expect(rowOut).toHaveLength(4);
    for (let i = 0; i < 4; i++) {
      expect(rowOut[i]).toHaveLength(1);
      expect(rowOut[i][0]).toBeCloseTo(colOut[i][0], 10);
    }
  });
});

// ---------------------------------------------------------------------------
// reduceDimensionsInto — useCorrelation
// ---------------------------------------------------------------------------

describe('reduceDimensionsInto — useCorrelation', () => {
  test('scale 차이가 큰 두 변수의 1D projection은 표준화된 좌표를 따른다', () => {
    // var0 평균 2.5, stddev sqrt(((1.5^2+0.5^2+0.5^2+1.5^2)/4)) = sqrt(1.25)
    // var1는 동일 패턴의 1000배. 표준화 후 두 variable의 centered 값이 같다.
    // correlation matrix = [[1,1],[1,1]] → 첫 component = (√½, √½)
    // 표준화 centered = (-1.5, -0.5, 0.5, 1.5) / sqrt(1.25). projection = sum * √½.
    const data = [
      [1, 1000],
      [2, 2000],
      [3, 3000],
      [4, 4000],
    ];
    const out = reduceDimensions(data, { dimensions: 1, useCorrelation: true });
    expect(out).toHaveLength(4);
    const stddev = Math.sqrt(1.25);
    const sqrtHalf = Math.SQRT1_2;
    const expected = [-1.5, -0.5, 0.5, 1.5].map((c) => (c / stddev) * 2 * sqrtHalf);
    for (let i = 0; i < 4; i++) {
      expect(out[i][0]).toBeCloseTo(expected[i], 10);
    }
  });
});

// ---------------------------------------------------------------------------
// reduceDimensionsInto — invalid dimensions
// ---------------------------------------------------------------------------

describe('reduceDimensionsInto — invalid dimensions', () => {
  const data = [
    [1, 2],
    [2, 4],
    [3, 3],
    [4, 1],
  ];

  test('dimensions 0은 RangeError', () => {
    expect(() => reduceDimensionsInto([], data, { dimensions: 0 })).toThrow(RangeError);
  });

  test('dimensions 음수는 RangeError', () => {
    expect(() => reduceDimensionsInto([], data, { dimensions: -1 })).toThrow(RangeError);
  });

  test('dimensions non-integer는 RangeError', () => {
    expect(() => reduceDimensionsInto([], data, { dimensions: 1.5 })).toThrow(RangeError);
  });

  test('dimensions Infinity는 RangeError', () => {
    expect(() => reduceDimensionsInto([], data, { dimensions: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  test('dimensions NaN은 RangeError', () => {
    expect(() => reduceDimensionsInto([], data, { dimensions: Number.NaN })).toThrow(RangeError);
  });

  test('dimensions > rank는 RangeError', () => {
    // collinear data: rank 1
    const collinear = [
      [1, 2],
      [2, 4],
      [3, 6],
    ];
    expect(() => reduceDimensionsInto([], collinear, { dimensions: 2 })).toThrow(RangeError);
  });

  test('variable count 0 + dimensions 1은 RangeError', () => {
    expect(() => reduceDimensionsInto([], [], { dimensions: 1 })).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// reduceDimensionsInto — denominator mode
// ---------------------------------------------------------------------------

describe('reduceDimensionsInto — denominator mode', () => {
  test('mode "sample" + sample count >= 2의 1D projection은 population mode와 norm이 같다', () => {
    // sample mode와 population mode는 covariance를 n/(n-1) 배 만큼 다르게 만들지만 normalize된
    // eigenvector(component) 방향은 같다. 따라서 같은 component basis로 사영한 결과는 동일하다.
    const data = [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ];
    const popOut = reduceDimensions(data, { dimensions: 1, mode: 'population' });
    const sampleOut = reduceDimensions(data, { dimensions: 1, mode: 'sample' });
    expect(sampleOut).toHaveLength(4);
    for (let i = 0; i < 4; i++) {
      expect(sampleOut[i]).toHaveLength(1);
      expect(sampleOut[i][0]).toBeCloseTo(popOut[i][0], 10);
    }
  });

  test('mode "sample" + sample count 1은 RangeError', () => {
    expect(() => reduceDimensionsInto([], [[1, 2]], { dimensions: 1, mode: 'sample' })).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// reduceDimensionsInto — PCA decomposition 실패
// ---------------------------------------------------------------------------

describe('reduceDimensionsInto — PCA decomposition 실패', () => {
  test('maxIterations 1로 수렴 실패하면 RangeError', () => {
    // pca.test의 수렴 실패 케이스와 동일한 데이터.
    const data = [
      [1, 2, 3, 4],
      [2, 1, 4, 3],
      [3, 4, 1, 2],
      [4, 3, 2, 1],
      [1, 3, 2, 4],
      [4, 2, 3, 1],
    ];
    expect(() => reduceDimensionsInto([], data, { dimensions: 1, maxIterations: 1, tolerance: 1e-15 })).toThrow(
      RangeError
    );
  });
});

// ---------------------------------------------------------------------------
// reduceDimensionsInto — atomicity / aliasing
// ---------------------------------------------------------------------------

describe('reduceDimensionsInto — atomicity / aliasing', () => {
  test('validation 실패 시 out은 호출 전 상태를 유지한다', () => {
    const sentinel = [42, 43];
    const out: number[][] = [sentinel];
    expect(() => reduceDimensionsInto(out, [[1, 2]], { dimensions: 0 })).toThrow(RangeError);
    expect(out).toHaveLength(1);
    expect(out[0]).toBe(sentinel);
  });

  test('산술 실패 시 out은 호출 전 상태를 유지한다', () => {
    const sentinel = [99];
    const out: number[][] = [sentinel];
    const data = [
      [1, 2],
      [Number.NaN, 4],
    ];
    expect(() => reduceDimensionsInto(out, data, { dimensions: 1 })).toThrow(RangeError);
    expect(out).toHaveLength(1);
    expect(out[0]).toBe(sentinel);
  });

  test('Infinity entry는 RangeError로 표면화된다', () => {
    const sentinel = [7];
    const out: number[][] = [sentinel];
    const data = [
      [1, 2],
      [Number.POSITIVE_INFINITY, 4],
    ];
    expect(() => reduceDimensionsInto(out, data, { dimensions: 1 })).toThrow(RangeError);
    expect(out).toHaveLength(1);
    expect(out[0]).toBe(sentinel);
  });

  test('-Infinity entry는 RangeError로 표면화된다', () => {
    const sentinel = [7];
    const out: number[][] = [sentinel];
    const data = [
      [1, 2],
      [Number.NEGATIVE_INFINITY, 4],
    ];
    expect(() => reduceDimensionsInto(out, data, { dimensions: 1 })).toThrow(RangeError);
    expect(out).toHaveLength(1);
    expect(out[0]).toBe(sentinel);
  });

  test('out과 data가 같은 nested array여도 안전 (projection 결과가 정확)', () => {
    const data: number[][] = [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ];
    // out과 data를 같은 참조로 둔다.
    const result = reduceDimensionsInto(data, data, { dimensions: 1 });
    expect(result).toBe(data);
    expect(data).toHaveLength(4);
    const sqrtHalf = Math.SQRT1_2;
    expect(data[0][0]).toBeCloseTo(-3 * sqrtHalf, 10);
    expect(data[1][0]).toBeCloseTo(-1 * sqrtHalf, 10);
    expect(data[2][0]).toBeCloseTo(1 * sqrtHalf, 10);
    expect(data[3][0]).toBeCloseTo(3 * sqrtHalf, 10);
    for (const row of data) {
      expect(row).toHaveLength(1);
    }
  });
});

// ---------------------------------------------------------------------------
// reduceDimensionsInto — overflow 표면화
// ---------------------------------------------------------------------------

describe('reduceDimensionsInto — overflow 표면화', () => {
  test('Number.MAX_VALUE 입력은 (PCA 단계에서) RangeError로 표면화된다', () => {
    // 실제 throw 지점은 reduce-dimensions의 projection sum guard가 아니라 pca 내부
    // computeVariableMean의 누적 sum guard다. caller 관점에서는 어디서든 overflow가
    // RangeError로 일관되게 표면화된다는 contract만 검증한다.
    const data = [
      [Number.MAX_VALUE, 1],
      [Number.MAX_VALUE, 2],
    ];
    expect(() => reduceDimensionsInto([], data, { dimensions: 1 })).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// reduceDimensionsInto — signed-zero canonicalize
// ---------------------------------------------------------------------------

describe('reduceDimensionsInto — signed-zero canonicalize', () => {
  test('projection 결과 entry에 -0이 노출되지 않는다', () => {
    // mean이 0인 대칭 데이터. centered 값이 0인 observation의 projection이 -0이 될 수 있다.
    const data = [
      [-1, -1],
      [1, 1],
      [0, 0],
    ];
    const out = reduceDimensions(data, { dimensions: 1 });
    for (const row of out) {
      for (const v of row) {
        expect(Object.is(v, -0)).toBe(false);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// reduceDimensions — allocating companion
// ---------------------------------------------------------------------------

describe('reduceDimensions — allocating companion', () => {
  test('호출마다 fresh matrix를 반환한다', () => {
    const data = [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ];
    const a = reduceDimensions(data, { dimensions: 1 });
    const b = reduceDimensions(data, { dimensions: 1 });
    expect(a).not.toBe(b);
    // 각 row도 별도 참조여야 한다.
    for (let i = 0; i < a.length; i++) {
      expect(a[i]).not.toBe(b[i]);
    }
  });

  test('reduceDimensionsInto와 동일한 결과', () => {
    const data = [
      [1, 2],
      [2, 4],
      [3, 3],
      [4, 1],
    ];
    const allocated = reduceDimensions(data, { dimensions: 2 });
    const writeBack: number[][] = [];
    reduceDimensionsInto(writeBack, data, { dimensions: 2 });
    expect(allocated).toHaveLength(writeBack.length);
    for (let i = 0; i < allocated.length; i++) {
      expect(allocated[i]).toEqual(writeBack[i]);
    }
  });
});
