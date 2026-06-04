/**
 * statistics.covarianceMatrixInto / covarianceMatrix matrix helper를 검증한다.
 * orientation, denominator, no-variable 경계, validation, symmetric/diagonal, failure atomicity, aliasing, companion을 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { covarianceMatrix } from '../../../src/statistics/covariance-matrix';
import { covarianceMatrixInto } from '../../../src/statistics/covariance-matrix-into';

describe('covarianceMatrixInto — default "columns" orientation', () => {
  test('row=observation, column=variable로 계산한다', () => {
    // data: 2 variables, 3 observations
    // var0 samples = [1, 2, 3]: mean=2, deltas=[-1,0,1], sq=2
    // var1 samples = [2, 4, 6]: mean=4, deltas=[-2,0,2], sq=8
    // pop cov(0,0) = 2/3, cov(1,1) = 8/3, cov(0,1) = (2+0+2)/3 = 4/3
    const out: number[][] = [];
    const result = covarianceMatrixInto(out, [
      [1, 2],
      [2, 4],
      [3, 6],
    ]);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out[0][0]).toBeCloseTo(2 / 3, 12);
    expect(out[0][1]).toBeCloseTo(4 / 3, 12);
    expect(out[1][0]).toBeCloseTo(4 / 3, 12);
    expect(out[1][1]).toBeCloseTo(8 / 3, 12);
  });

  test('대각선은 각 variable variance', () => {
    // [1, 2, 3] variance = 2/3
    const out = covarianceMatrix([[1], [2], [3]]);
    expect(out).toHaveLength(1);
    expect(out[0][0]).toBeCloseTo(2 / 3, 12);
  });
});

describe('covarianceMatrixInto — "rows" orientation', () => {
  test('row=variable, column=observation로 계산한다', () => {
    // data rows are variables
    // var0 = [1, 2, 3]: cov(0,0) = 2/3
    // var1 = [2, 4, 6]: cov(1,1) = 8/3
    // cov(0,1) = 4/3
    const out = covarianceMatrix(
      [
        [1, 2, 3],
        [2, 4, 6],
      ],
      { orientation: 'rows' }
    );
    expect(out).toHaveLength(2);
    expect(out[0][0]).toBeCloseTo(2 / 3, 12);
    expect(out[0][1]).toBeCloseTo(4 / 3, 12);
    expect(out[1][1]).toBeCloseTo(8 / 3, 12);
  });
});

// ---------------------------------------------------------------------------
// covarianceMatrixInto — denominator
// ---------------------------------------------------------------------------

describe('covarianceMatrixInto — population/sample denominator', () => {
  test('population denominator는 sampleCount', () => {
    // var0=[1,3], var1=[2,6]: meanX=2, meanY=4, prodSum=(-1)(-2)+(1)(2)=4
    // pop cov(0,1) = 4/2 = 2
    const out = covarianceMatrix([
      [1, 2],
      [3, 6],
    ]);
    expect(out[0][1]).toBe(2);
  });

  test('sample denominator는 sampleCount - 1', () => {
    const out = covarianceMatrix(
      [
        [1, 2],
        [3, 6],
      ],
      { mode: 'sample' }
    );
    expect(out[0][1]).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// covarianceMatrixInto — no-variable / sample count 경계
// ---------------------------------------------------------------------------

describe('covarianceMatrixInto — no variable', () => {
  test('빈 matrix는 [] commit', () => {
    const out: number[][] = [
      [1, 2],
      [3, 4],
    ];
    const result = covarianceMatrixInto(out, []);
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('columns orientation에서 [[], []]는 variable count 0 → []', () => {
    const out: number[][] = [[7, 8]];
    covarianceMatrixInto(out, [[], []]);
    expect(out).toEqual([]);
  });

  test('rows orientation에서 []는 variable count 0 → []', () => {
    expect(covarianceMatrix([], { orientation: 'rows' })).toEqual([]);
  });

  test('companion covarianceMatrix도 빈 입력에서 []', () => {
    expect(covarianceMatrix([])).toEqual([]);
  });
});

describe('covarianceMatrixInto — sample count 경계', () => {
  test('columns orientation에서 sampleCount=0인데 variableCount>0이면 RangeError', () => {
    // [[]]은 row 1개, columnCount 0 → variableCount 0이라 위 분기에서 [] 반환
    // sampleCount=0인데 variableCount>0 케이스: rows orientation의 [[]]
    expect(() => covarianceMatrix([[]], { orientation: 'rows' })).toThrow(RangeError);
  });

  test('population mode에서 sampleCount=1은 허용 (cov=0)', () => {
    // 1 observation, 2 variables: deltas=0 → all cov entries = 0
    const out = covarianceMatrix([[3, 5]]);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual([0, 0]);
    expect(out[1]).toEqual([0, 0]);
  });

  test('sample mode에서 sampleCount=1은 RangeError', () => {
    expect(() => covarianceMatrix([[3, 5]], { mode: 'sample' })).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// covarianceMatrixInto — invalid input
// ---------------------------------------------------------------------------

describe('covarianceMatrixInto — invalid input', () => {
  test('non-array data는 TypeError', () => {
    expect(() => covarianceMatrixInto([], 'x' as unknown as readonly (readonly number[])[])).toThrow(TypeError);
    expect(() => covarianceMatrixInto([], null as unknown as readonly (readonly number[])[])).toThrow(TypeError);
  });

  test('non-array row는 TypeError', () => {
    expect(() => covarianceMatrixInto([], [[1, 2], 'x' as unknown as readonly number[]])).toThrow(TypeError);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() =>
      covarianceMatrix([
        [1, 2, 3],
        [4, 5],
      ])
    ).toThrow(RangeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() =>
      covarianceMatrix([
        [1, 2],
        [3, Number.NaN],
      ])
    ).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() =>
      covarianceMatrix([
        [1, Number.POSITIVE_INFINITY],
        [3, 4],
      ])
    ).toThrow(RangeError);
  });

  test('invalid orientation은 RangeError', () => {
    expect(() => covarianceMatrix([[1]], { orientation: 'bad' as never })).toThrow(RangeError);
  });

  test('invalid mode는 RangeError', () => {
    expect(() => covarianceMatrix([[1]], { mode: 'bad' as never })).toThrow(RangeError);
  });

  test('invalid orientation은 빈 입력에서도 fail-fast', () => {
    expect(() => covarianceMatrix([], { orientation: 'bad' as never })).toThrow(RangeError);
  });

  test('invalid mode는 빈 입력에서도 fail-fast', () => {
    expect(() => covarianceMatrix([], { mode: 'bad' as never })).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// covarianceMatrixInto — symmetric, signed-zero
// ---------------------------------------------------------------------------

describe('covarianceMatrixInto — symmetric & diagonal', () => {
  test('결과는 symmetric square matrix', () => {
    const out = covarianceMatrix([
      [1, 2, 3],
      [2, 4, 5],
      [3, 6, 7],
      [4, 8, 9],
    ]);
    expect(out).toHaveLength(3);
    expect(out[0]).toHaveLength(3);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        expect(out[r][c]).toBe(out[c][r]);
      }
    }
  });

  test('상수 variable의 diagonal entry는 +0', () => {
    // var0=[5,5,5]: deltas=0, sq=0 → cov(0,0)=0
    const out = covarianceMatrix([[5], [5], [5]]);
    expect(Object.is(out[0][0], 0)).toBe(true);
    expect(Object.is(out[0][0], -0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// covarianceMatrixInto — failure atomicity & aliasing
// ---------------------------------------------------------------------------

describe('covarianceMatrixInto — failure atomicity', () => {
  test('non-array data TypeError에서 out 상태 유지', () => {
    const out: number[][] = [
      [1, 2],
      [3, 4],
    ];
    expect(() => covarianceMatrixInto(out, 'x' as unknown as readonly (readonly number[])[])).toThrow(TypeError);
    expect(out).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test('ragged matrix RangeError에서 out 상태 유지', () => {
    const out: number[][] = [[9, 8]];
    expect(() => covarianceMatrixInto(out, [[1, 2], [3]])).toThrow(RangeError);
    expect(out).toEqual([[9, 8]]);
  });

  test('NaN entry RangeError에서 out 상태 유지', () => {
    const out: number[][] = [
      [7, 7],
      [7, 7],
    ];
    expect(() =>
      covarianceMatrixInto(out, [
        [1, 2],
        [3, Number.NaN],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([
      [7, 7],
      [7, 7],
    ]);
  });

  test('sample mode + sampleCount=1 RangeError에서 out 상태 유지', () => {
    const out: number[][] = [[1, 2]];
    expect(() => covarianceMatrixInto(out, [[3, 5]], { mode: 'sample' })).toThrow(RangeError);
    expect(out).toEqual([[1, 2]]);
  });

  test('invalid orientation에서 out 상태 유지', () => {
    const out: number[][] = [[1, 2]];
    expect(() => covarianceMatrixInto(out, [[3, 5]], { orientation: 'bad' as never })).toThrow(RangeError);
    expect(out).toEqual([[1, 2]]);
  });
});

describe('covarianceMatrixInto — out/data aliasing', () => {
  test('같은 nested array를 out/data로 넘겨도 안전하다', () => {
    const arr: number[][] = [
      [1, 2],
      [2, 4],
      [3, 6],
    ];
    const result = covarianceMatrixInto(arr, arr);
    expect(result).toBe(arr);
    expect(arr).toHaveLength(2);
    expect(arr[0][0]).toBeCloseTo(2 / 3, 12);
    expect(arr[0][1]).toBeCloseTo(4 / 3, 12);
    expect(arr[1][1]).toBeCloseTo(8 / 3, 12);
  });

  test('빈 matrix aliasing도 안전하다', () => {
    const arr: number[][] = [];
    const result = covarianceMatrixInto(arr, arr);
    expect(result).toBe(arr);
    expect(arr).toEqual([]);
  });

  test('rows orientation aliasing도 안전하다', () => {
    const arr: number[][] = [
      [1, 2, 3],
      [2, 4, 6],
    ];
    covarianceMatrixInto(arr, arr, { orientation: 'rows' });
    expect(arr).toHaveLength(2);
    expect(arr[0][1]).toBeCloseTo(4 / 3, 12);
  });
});

// ---------------------------------------------------------------------------
// covarianceMatrix — companion
// ---------------------------------------------------------------------------

describe('covarianceMatrix — companion', () => {
  test('새 matrix를 반환한다', () => {
    const result = covarianceMatrix([
      [1, 2],
      [2, 4],
      [3, 6],
    ]);
    expect(result).toHaveLength(2);
    expect(result[0][0]).toBeCloseTo(2 / 3, 12);
  });

  test('빈 입력은 []', () => {
    expect(covarianceMatrix([])).toEqual([]);
  });

  test('non-array data는 TypeError', () => {
    expect(() => covarianceMatrix(null as unknown as readonly (readonly number[])[])).toThrow(TypeError);
  });
});
