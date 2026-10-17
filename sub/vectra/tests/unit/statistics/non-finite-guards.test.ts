/**
 * statistics 함수의 빈 입력과 비유한 값 가드 테스트.
 *
 * 검증 항목:
 *  1. 빈 배열과 NaN 입력은 RangeError다 (sum, product, geometricMean, harmonicMean, digitize).
 *  2. 입력은 유한한데 중간 계산이 Infinity가 되면 RangeError다. 결과를 Infinity로 돌려주지 않는다.
 *  3. 표본이 없는 행렬 입력은 RangeError다 (correlationMatrix, reduceDimensions).
 *
 * 설계 메모:
 *  - 분기마다 에러 메시지가 다르다. 메시지 정규식으로 어느 가드가 던졌는지까지 고정한다.
 *  - 오버플로 입력은 `Number.MAX_VALUE`와 그 절반, 1e154 근처(제곱이 넘치는 값)를 쓴다.
 */
import { describe, expect, test } from 'vitest';
import { correlationMatrix } from '../../../src/statistics/correlation-matrix';
import { covariance } from '../../../src/statistics/covariance';
import { covarianceMatrix } from '../../../src/statistics/covariance-matrix';
import { digitize } from '../../../src/statistics/digitize';
import { geometricMean } from '../../../src/statistics/geometric-mean';
import { harmonicMean } from '../../../src/statistics/harmonic-mean';
import { histogram } from '../../../src/statistics/histogram';
import { mahalanobisDistance } from '../../../src/statistics/mahalanobis-distance';
import { median } from '../../../src/statistics/median';
import { medianAbsoluteDeviation } from '../../../src/statistics/median-absolute-deviation';
import { normalizeMinMax } from '../../../src/statistics/normalize-min-max';
import { percentile } from '../../../src/statistics/percentile';
import { product } from '../../../src/statistics/product';
import { reduceDimensions } from '../../../src/statistics/reduce-dimensions';
import { solveOverdeterminedSystem } from '../../../src/statistics/solve-overdetermined-system';
import { sum } from '../../../src/statistics/sum';
import { weightedVariance } from '../../../src/statistics/weighted-variance';

const MAX = Number.MAX_VALUE;

describe('빈 입력과 NaN 입력', () => {
  test('sum은 빈 배열과 NaN entry를 거부한다', () => {
    expect(() => sum([])).toThrow(/must not be empty/);
    expect(() => sum([1, Number.NaN])).toThrow(/values\[1\] must be a finite number/);
  });

  test('product는 빈 배열을 거부한다', () => {
    expect(() => product([])).toThrow(/must not be empty/);
  });

  test('geometricMean은 빈 배열과 NaN entry를 거부한다', () => {
    expect(() => geometricMean([])).toThrow(/must not be empty/);
    expect(() => geometricMean([Number.NaN])).toThrow(/values\[0\] must be a finite number/);
  });

  test('harmonicMean은 빈 배열과 NaN entry를 거부한다', () => {
    expect(() => harmonicMean([])).toThrow(/must not be empty/);
    expect(() => harmonicMean([Number.NaN])).toThrow(/values\[0\] must be a finite number/);
  });

  test('digitize는 NaN value를 거부한다', () => {
    expect(() => digitize([0.5, Number.NaN], [0, 1])).toThrow(/values\[1\] must be a finite number/);
  });
});

describe('표본이 없는 행렬 입력', () => {
  test('correlationMatrix는 변수는 있고 표본이 0개인 rows 입력을 거부한다', () => {
    expect(() => correlationMatrix([[]], { orientation: 'rows' })).toThrow(/sample count >= 1/);
  });

  test('sample 모드 correlationMatrix는 표본이 1개이면 거부한다', () => {
    expect(() => correlationMatrix([[1]], { mode: 'sample' })).toThrow(/sample count >= 2, got 1/);
  });

  test('reduceDimensions는 변수는 있고 표본이 0개인 rows 입력을 거부한다', () => {
    expect(() => reduceDimensions([[]], { dimensions: 1, orientation: 'rows' })).toThrow(/sample count >= 1/);
  });
});

describe('중간 계산이 넘치는 입력', () => {
  test('harmonicMean은 역수 합이 아닌 최종 결과가 넘치면 거부한다', () => {
    // 1 / MAX는 subnormal이라 다시 뒤집으면 Infinity가 된다
    expect(() => harmonicMean([MAX])).toThrow(/harmonic mean must be finite/);
  });

  test('median과 percentile은 두 극값의 중간 계산이 넘치면 거부한다', () => {
    expect(() => median([MAX, -MAX])).toThrow(/median result must be finite/);
    expect(() => percentile([MAX, -MAX], 50)).toThrow(/percentile result must be finite/);
  });

  test('medianAbsoluteDeviation은 편차가 넘치면 거부한다', () => {
    expect(() => medianAbsoluteDeviation([MAX, -MAX])).toThrow(/absolute deviation at index 0 must be finite/);
  });

  test('covariance는 두 번째 입력의 제곱이 넘치면 거부한다', () => {
    expect(() => covariance([1, 2, 3], [MAX, 1, 1])).toThrow(/second squared delta at index 0 must be finite/);
  });

  test('histogram은 구간 폭이 넘치거나 0이면 거부한다', () => {
    expect(() => histogram([MAX, -MAX])).toThrow(/bin edge span must be finite and > 0, got Infinity/);
    expect(() => histogram([MAX])).toThrow(/bin edge span must be finite and > 0, got 0/);
  });

  test('histogram은 경계 값이 넘치면 거부한다', () => {
    expect(() => histogram([MAX, 1])).toThrow(/bin edge at index \d+ must be finite/);
  });

  test('normalizeMinMax는 출력 범위의 폭이 넘치거나 결과가 넘치면 거부한다', () => {
    expect(() => normalizeMinMax([1, 2, 3], { range: [-MAX, MAX] })).toThrow(/output span must be finite/);
    expect(() => normalizeMinMax([1e200, -1e200], { range: [0, MAX] })).toThrow(/result at index 0 must be finite/);
  });

  test('weightedVariance는 중심화한 편차가 넘치면 거부한다', () => {
    expect(() => weightedVariance([-MAX, MAX], [Number.MIN_VALUE, 1])).toThrow(
      /centered delta at index 0 must be finite/
    );
  });
});

describe('행렬 통계의 넘침', () => {
  test('covarianceMatrix는 NaN entry를 거부한다', () => {
    expect(() =>
      covarianceMatrix([
        [Number.NaN, 1],
        [2, 3],
      ])
    ).toThrow(/data\[0\]\[0\] must be a finite number/);
  });

  test('rows 방향 covarianceMatrix도 NaN entry를 거부한다', () => {
    expect(() =>
      covarianceMatrix(
        [
          [1, Number.NaN],
          [2, 3],
        ],
        { orientation: 'rows' }
      )
    ).toThrow(/data\[0\]\[1\] must be a finite number/);
  });

  test('covarianceMatrix는 편차의 제곱이 넘치면 거부한다', () => {
    expect(() =>
      covarianceMatrix([
        [MAX, 1],
        [-MAX, 2],
      ])
    ).toThrow(/squared delta at sample 0 must be finite/);
  });

  test('covarianceMatrix는 제곱합이 누적 중 넘치면 거부한다', () => {
    // 편차 제곱 1e154² = 1e308은 유한하지만 세 번 더하면 넘친다
    expect(() =>
      covarianceMatrix([
        [1e154, 1e154],
        [-1e154, 1e154],
        [1e154, 1e154],
      ])
    ).toThrow(/squared sum must be finite/);
  });
});

describe('Mahalanobis 거리의 넘침', () => {
  const identity = [
    [1, 0],
    [0, 1],
  ];

  test('점과 평균의 차이가 넘치면 거부한다', () => {
    expect(() => mahalanobisDistance([-MAX, 0], [MAX, 0], identity)).toThrow(/delta at index 0 must be finite/);
  });

  test('정규화한 좌표의 제곱이 넘치면 거부한다', () => {
    expect(() =>
      mahalanobisDistance(
        [MAX, 0],
        [0, 0],
        [
          [MAX, 0],
          [0, MAX],
        ]
      )
    ).toThrow(/z\[0\]\^2 must be finite/);
  });

  test('공분산의 Cholesky 곱이 넘치면 거부한다', () => {
    expect(() =>
      mahalanobisDistance(
        [0, 0],
        [0, 0],
        [
          [MAX, MAX],
          [MAX, -MAX],
        ]
      )
    ).toThrow(/Cholesky product at \(1, 1, 0\) must be finite/);
  });
});

describe('최소제곱의 넘침', () => {
  test('Q^T b가 넘치면 거부한다', () => {
    expect(() => solveOverdeterminedSystem([[1], [2]], [MAX, MAX])).toThrow(/Q\^T b at basis 0/);
  });

  test('QR 갱신 중 잔차가 넘치면 거부한다', () => {
    expect(() =>
      solveOverdeterminedSystem(
        [
          [1, MAX],
          [2, -MAX],
        ],
        [1, 2]
      )
    ).toThrow(/non-finite QR residual at row 0, column 1/);
  });

  test('역대입 값이 넘치면 거부한다', () => {
    expect(() =>
      solveOverdeterminedSystem(
        [
          [MAX, MAX],
          [1, 2],
        ],
        [MAX, MAX]
      )
    ).toThrow(/non-finite back-substitution at index 0/);
  });
});
