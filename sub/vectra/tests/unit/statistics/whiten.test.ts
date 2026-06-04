/**
 * statistics whiten / whitenInto — S9-RM-011 unit tests.
 */

import { describe, expect, test } from 'vitest';
import { whiten } from '../../../src/statistics/whiten';
import { whitenInto } from '../../../src/statistics/whiten-into';

// ---------------------------------------------------------------------------
// whiten / whitenInto
// ---------------------------------------------------------------------------

/**
 * whitening 후 결과 covariance가 identity에 가까운지 확인하는 helper.
 *
 * tolerance는 numerical 차이로 인한 assertion tolerance(epsilon 옵션과 다름).
 */
function expectCovarianceNearIdentity(whitened: readonly (readonly number[])[], tolerance = 1e-9): void {
  const n = whitened.length;
  if (n === 0) return;
  const variableCount = whitened[0].length;
  // 평균 계산
  const means = new Array<number>(variableCount).fill(0);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < variableCount; c++) means[c] += whitened[r][c];
  }
  for (let c = 0; c < variableCount; c++) means[c] /= n;
  // covariance population denominator로 산출
  for (let i = 0; i < variableCount; i++) {
    for (let j = 0; j < variableCount; j++) {
      let sum = 0;
      for (let r = 0; r < n; r++) sum += (whitened[r][i] - means[i]) * (whitened[r][j] - means[j]);
      const cov = sum / n;
      const expected = i === j ? 1 : 0;
      expect(Math.abs(cov - expected)).toBeLessThan(tolerance);
    }
  }
}

describe('whiten — columns orientation (기본)', () => {
  test('2D dataset whitening 후 column covariance는 identity 근사', () => {
    // 4개 observation, 2 variable. 임의의 correlated dataset.
    const data = [
      [1, 2],
      [2, 3],
      [3, 5],
      [4, 6],
    ];
    const whitened = whiten(data);
    expect(whitened).toHaveLength(4);
    expect(whitened[0]).toHaveLength(2);
    expectCovarianceNearIdentity(whitened, 1e-9);
  });

  test('whitening 후 결과는 평균 0', () => {
    const data = [
      [10, 20],
      [12, 25],
      [11, 22],
      [9, 18],
    ];
    const whitened = whiten(data);
    const sum0 = whitened.reduce((s, row) => s + row[0], 0);
    const sum1 = whitened.reduce((s, row) => s + row[1], 0);
    expect(Math.abs(sum0)).toBeLessThan(1e-9);
    expect(Math.abs(sum1)).toBeLessThan(1e-9);
  });

  test('sample mode도 정상 동작', () => {
    const data = [
      [1, 2],
      [2, 3],
      [3, 5],
      [4, 6],
    ];
    const whitened = whiten(data, { mode: 'sample' });
    expect(whitened).toHaveLength(4);
    // sample denominator일 때 결과 covariance는 (n - 1) / n = 0.75 분 단위 identity.
    // 정확한 cov(z) 검증은 생략하고 shape만 확인.
    expect(whitened[0]).toHaveLength(2);
  });
});

describe('whiten — rows orientation', () => {
  test('row=variable, column=observation', () => {
    // 2 variable, 4 observation = 2x4
    const data = [
      [1, 2, 3, 4], // variable 0
      [2, 3, 5, 6], // variable 1
    ];
    const whitened = whiten(data, { orientation: 'rows' });
    expect(whitened).toHaveLength(2);
    expect(whitened[0]).toHaveLength(4);
    // row=variable, column=observation으로 결과를 transpose해 column-covariance를 검증.
    const transposed = [
      [whitened[0][0], whitened[1][0]],
      [whitened[0][1], whitened[1][1]],
      [whitened[0][2], whitened[1][2]],
      [whitened[0][3], whitened[1][3]],
    ];
    expectCovarianceNearIdentity(transposed, 1e-9);
  });
});

describe('whiten — invalid input', () => {
  test('non-array는 TypeError', () => {
    expect(() => whiten(null as unknown as readonly (readonly number[])[])).toThrow(TypeError);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() =>
      whiten([[1, 2], [3] as unknown as readonly number[]] as unknown as readonly (readonly number[])[])
    ).toThrow(RangeError);
  });

  test('entry non-finite는 RangeError', () => {
    expect(() =>
      whiten([
        [1, Number.NaN],
        [2, 3],
      ])
    ).toThrow(RangeError);
  });

  test('variable count 0(columns) → 빈 matrix', () => {
    expect(whiten([[], []])).toEqual([]);
  });

  test('variable count 0(rows) → 빈 matrix', () => {
    expect(whiten([], { orientation: 'rows' })).toEqual([]);
  });

  test('sample count 0 + variable count > 0 → RangeError', () => {
    expect(() => whiten([], { orientation: 'columns' })).not.toThrow(); // []는 variable count 0
    // 'columns' + rowCount 0이면 variable count도 0이라 무관.
    expect(() => whiten([[]], { orientation: 'rows' })).toThrow(RangeError); // 1 variable, 0 sample
  });

  test('sample mode + sample count < 2 → RangeError', () => {
    expect(() => whiten([[1, 2]], { mode: 'sample' })).toThrow(RangeError);
  });

  test('zero variance variable(singular covariance)은 RangeError', () => {
    // variable 0이 상수 → covariance에 zero pivot 발생.
    expect(() =>
      whiten([
        [5, 1],
        [5, 2],
        [5, 3],
      ])
    ).toThrow(RangeError);
  });

  test('invalid orientation은 RangeError', () => {
    expect(() => whiten([[1]], { orientation: 'diag' as unknown as 'columns' | 'rows' })).toThrow(RangeError);
  });

  test('invalid mode는 RangeError', () => {
    expect(() => whiten([[1], [2]], { mode: 'bayes' as unknown as 'population' | 'sample' })).toThrow(RangeError);
  });

  test('epsilon 옵션이 음수면 RangeError', () => {
    expect(() =>
      whiten(
        [
          [1, 2],
          [3, 4],
        ],
        { epsilon: -1 }
      )
    ).toThrow(RangeError);
  });
});

describe('whitenInto — atomicity / aliasing', () => {
  test('validation 실패 시 out 미수정', () => {
    const out = [[9, 9]];
    expect(() =>
      whitenInto(out, [
        [1, Number.NaN],
        [2, 3],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out === data aliasing 안전(materialize + commit)', () => {
    const arr = [
      [1, 2],
      [2, 3],
      [3, 5],
      [4, 6],
    ];
    whitenInto(arr, arr);
    expect(arr).toHaveLength(4);
    expect(arr[0]).toHaveLength(2);
    expectCovarianceNearIdentity(arr, 1e-9);
  });

  test('정상 호출은 out 반환', () => {
    const out: number[][] = [];
    const ret = whitenInto(out, [
      [1, 2],
      [2, 3],
      [3, 5],
    ]);
    expect(ret).toBe(out);
    expect(out).toHaveLength(3);
  });
});

describe('whiten — signed zero', () => {
  test('non-degenerate SPD 데이터에서 결과 entry의 -0은 0으로 canonicalize', () => {
    // 평균이 0인 SPD 데이터. mean === 0 + delta === 0인 sample은 z === 0이 되고
    // 산식에 따라 -0이 발생할 수 있다(예: -0 * 1).
    const data = [
      [-2, -1],
      [0, 0], // mean에 가까운 sample
      [2, 1],
      [-1, -2],
      [1, 2],
    ];
    const whitened = whiten(data);
    // 모든 결과 entry는 `-0`이 아니라 `0`이어야 한다(canonicalize 정책).
    for (const row of whitened) {
      for (const v of row) {
        expect(Object.is(v, -0)).toBe(false);
      }
    }
  });
});
