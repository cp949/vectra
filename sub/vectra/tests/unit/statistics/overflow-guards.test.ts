/**
 * statistics 함수의 중간 계산 overflow·underflow 가드 테스트.
 *
 * 검증 항목:
 *  1. 입력은 유한한데 중간 계산이 Infinity가 되거나 0으로 무너지면 RangeError다.
 *  2. 가드마다 던지는 에러 메시지가 달라서, 메시지 정규식으로 어느 가드가 던졌는지까지 고정한다.
 *
 * 설계 메모:
 *  - 입력은 `Number.MAX_VALUE`, 제곱이 넘치는 1e154 근처, 제곱이 subnormal로 무너지는 1e-162 근처를 쓴다.
 *  - 같은 메시지를 내는 가드가 여러 함수에 있으면 함수마다 따로 호출한다.
 */
import { describe, expect, test } from 'vitest';
import { centerInto } from '../../../src/statistics/center-into';
import { correlation } from '../../../src/statistics/correlation';
import { correlationMatrix } from '../../../src/statistics/correlation-matrix';
import { covariance } from '../../../src/statistics/covariance';
import { covarianceMatrix } from '../../../src/statistics/covariance-matrix';
import { geometricMean } from '../../../src/statistics/geometric-mean';
import { histogramBinEdges } from '../../../src/statistics/histogram-bin-edges';
import { kurtosis } from '../../../src/statistics/kurtosis';
import { mahalanobisDistance } from '../../../src/statistics/mahalanobis-distance';
import { normalizeMinMax } from '../../../src/statistics/normalize-min-max';
import { pca } from '../../../src/statistics/pca';
import { reduceDimensions } from '../../../src/statistics/reduce-dimensions';
import { skewness } from '../../../src/statistics/skewness';
import { solveOverdeterminedSystem } from '../../../src/statistics/solve-overdetermined-system';
import { weightedMean } from '../../../src/statistics/weighted-mean';
import { weightedVariance } from '../../../src/statistics/weighted-variance';

const MAX = Number.MAX_VALUE;

/**
 * 공분산 행렬 `L Lᵀ`가 만드는 3x3 대칭 행렬을 `mahalanobisDistance`에 넘겨 에러를 확인한다.
 * 각 테스트는 `epsilon: 0`으로 Cholesky pivot 판정을 끄고 overflow 가드만 노출시킨다.
 */
function mahalanobis3(point: number[], mean: number[], cov: number[][]): number {
  return mahalanobisDistance(point, mean, cov, { epsilon: 0 });
}

describe('평균·중심화·공분산·상관 가드', () => {
  test('centerInto는 중심화한 값이 넘치면 거부한다', () => {
    expect(() => centerInto([], [MAX, -7, -1e308, -1e308])).toThrow(/centered entry at index 0 must be finite/);
  });

  test('covariance는 첫째 벡터의 중심화 값이 넘치면 거부한다', () => {
    expect(() => covariance([MAX, -7, -1e308, -1e308], [-1, -1e-160, 1.5e-162, 1e78])).toThrow(
      /first centered entry at index 0 must be finite/
    );
  });

  test('covariance는 둘째 벡터의 중심화 값이 넘치면 거부한다', () => {
    expect(() => covariance([1e78, 3, 7, 1e77], [MAX, -1e308, 1e-102, -MAX])).toThrow(
      /second centered entry at index 0 must be finite/
    );
  });

  test('covariance는 곱의 합이 넘치면 거부한다', () => {
    expect(() => covariance([1.2e154, -1.2e154], [1.2e154, -1.2e154])).toThrow(/product sum must be finite/);
  });

  test('covariance는 첫째 벡터의 제곱합이 넘치면 거부한다', () => {
    expect(() => covariance([-1e154, 1e154], [1, 3e-162])).toThrow(/first squared sum must be finite/);
  });

  test('covariance는 둘째 벡터의 제곱합이 넘치면 거부한다', () => {
    expect(() => covariance([1, 1e-100], [1e154, -1e154])).toThrow(/second squared sum must be finite/);
  });

  test('correlation은 제곱합의 곱이 넘치면 거부한다', () => {
    expect(() => correlation([7, 0], [-1e154, 0])).toThrow(/squared sum product must be finite/);
  });

  test('correlation은 제곱합의 곱이 0으로 무너지면 분모 가드로 거부한다', () => {
    expect(() => correlation([-3e-162, 3e-162], [0.5, 1])).toThrow(
      /correlation denominator must be finite and non-zero, got 0/
    );
  });

  test('correlationMatrix는 변수 쌍의 제곱합 곱이 넘치면 거부한다', () => {
    expect(() =>
      correlationMatrix([
        [7, 7],
        [2, -1e154],
      ])
    ).toThrow(/squared sum product at \(0, 1\) must be finite/);
  });

  test('correlationMatrix는 변수 쌍의 제곱합 곱이 0으로 무너지면 분모 가드로 거부한다', () => {
    expect(() =>
      correlationMatrix([
        [-0, 1e-170],
        [1e-102, 1e-102],
      ])
    ).toThrow(/correlation denominator at \(0, 1\) must be finite and non-zero, got 0/);
  });

  test('covarianceMatrix는 중심화 값이 넘치면 거부한다', () => {
    expect(() => covarianceMatrix([[MAX], [-MAX], [1e-170], [-MAX]])).toThrow(
      /variable\[0\] centered delta at sample 0 must be finite/
    );
  });
});

describe('가중 평균·기하 평균 가드', () => {
  test('weightedMean은 가중치 제곱합이 넘치면 거부한다', () => {
    expect(() => weightedMean([1, 1e78], [1e154, 1e154])).toThrow(/sumOfSquaredWeights must be finite/);
  });

  test('weightedMean은 가중합을 가중치 합으로 나눈 평균이 반올림으로 넘치면 거부한다', () => {
    expect(() => weightedMean(Array(10).fill(MAX), Array(10).fill(0.1))).toThrow(/weightedMean must be finite/);
  });

  test('weightedVariance는 가중 제곱 편차가 넘치면 거부한다', () => {
    expect(() => weightedVariance([1e155], [1e77])).toThrow(/weighted squared delta at index 0 must be finite/);
  });

  test('weightedVariance는 분모가 작아 결과가 넘치면 거부한다', () => {
    expect(() =>
      weightedVariance([1e103, -1e154, 1e-162, 1e154, -1], [3e-162, 1e-160, 1e-200, 1e-160, 3e-162], {
        mode: 'sample',
      })
    ).toThrow(/weighted variance must be finite/);
  });

  test('geometricMean은 log 평균이 반올림으로 넘치면 결과를 거부한다', () => {
    expect(geometricMean([MAX])).toBeGreaterThan(1.79e308);
    expect(() => geometricMean(Array(70).fill(MAX))).toThrow(/geometric mean must be finite, got Infinity/);
  });
});

describe('3차·4차 모멘트 가드', () => {
  test('skewness는 편차의 세제곱이 넘치면 거부한다', () => {
    expect(() => skewness([1e154, 7])).toThrow(/cubed delta at index 0 must be finite/);
  });

  test('skewness는 편차의 4제곱 합이 넘치면 거부한다', () => {
    expect(() => skewness([1e77, -1e77])).toThrow(/fourthSum must be finite/);
  });

  test('skewness는 분산의 1.5제곱이 0으로 무너지면 분모 가드로 거부한다', () => {
    expect(() => skewness([1e-150, -0])).toThrow(/skewness denominator must be a positive finite number/);
  });

  test('kurtosis는 분산의 제곱이 0으로 무너지면 분모 가드로 거부한다', () => {
    expect(() => kurtosis([1e-150, -0])).toThrow(/kurtosis denominator must be a positive finite number/);
  });
});

describe('정규화·히스토그램 가드', () => {
  test('normalizeMinMax는 입력 범위가 subnormal이라 배율이 넘치면 거부한다', () => {
    expect(() => normalizeMinMax([5e-324, -0])).toThrow(/scale factor must be finite/);
  });

  test('histogramBinEdges는 경계 계산이 넘치면 거부한다', () => {
    expect(() => histogramBinEdges([1, 1e308], { bins: 3 })).toThrow(/bin edge at index \d+ must be finite/);
  });
});

describe('Cholesky 기반 가드 (mahalanobisDistance)', () => {
  test('음수 pivot이 -Infinity가 되면 대각 가드로 거부한다', () => {
    expect(() =>
      mahalanobis3(
        [1e78, -1e154],
        [7, 1e154],
        [
          [1, 1e154],
          [1e154, -1e308],
        ]
      )
    ).toThrow(/Cholesky diagonal at \(1\) must be finite/);
  });

  test('곱의 합이 넘치면 합 가드로 거부한다', () => {
    const a = 1.3e154;
    expect(() =>
      mahalanobis3(
        [1, 1, 1],
        [0, 0, 0],
        [
          [1, 0, a],
          [0, 1, a],
          [a, a, 1e300],
        ]
      )
    ).toThrow(/Cholesky sum at \(2, 2, 1\) must be finite/);
  });

  test('비대각 분자가 넘치면 분자 가드로 거부한다', () => {
    expect(() =>
      mahalanobisDistance(
        [1, 1, 1],
        [0, 0, 0],
        [
          [1, 1e154, -1e154],
          [1e154, 1.5e308, 1.2e308],
          [-1e154, 1.2e308, 1e308],
        ]
      )
    ).toThrow(/Cholesky numerator at \(2, 1\) must be finite/);
  });

  test('비대각 값이 작은 pivot으로 나눠 넘치면 비대각 가드로 거부한다', () => {
    expect(() =>
      mahalanobis3(
        [1, 1],
        [0, 0],
        [
          [5e-324, 1e200],
          [1e200, 7],
        ]
      )
    ).toThrow(/Cholesky off-diagonal at \(1, 0\) must be finite/);
  });

  test('전방 대입의 곱의 합이 넘치면 합 가드로 거부한다', () => {
    const l = 9e153;
    expect(() =>
      mahalanobis3(
        [1e154, 1e154, 1],
        [0, 0, 0],
        [
          [1, 0, l],
          [0, 1, l],
          [l, l, 2 * l * l + 1e300],
        ]
      )
    ).toThrow(/forward solve sum at \(2, 1\) must be finite/);
  });

  test('전방 대입의 분자가 넘치면 분자 가드로 거부한다', () => {
    expect(() =>
      mahalanobis3(
        [0.5, MAX],
        [1e308, 1e-5],
        [
          [MAX, 1e308],
          [1e308, 1e308],
        ]
      )
    ).toThrow(/forward solve numerator at \(1\) must be finite/);
  });

  test('전방 대입의 곱이 넘치면 곱 가드로 거부한다', () => {
    expect(() =>
      mahalanobis3(
        [1e77, 1],
        [1e155, 1e-102],
        [
          [1e-162, -7],
          [-7, 1e200],
        ]
      )
    ).toThrow(/forward solve product at \(1, 0\) must be finite/);
  });

  test('전방 대입의 해가 작은 pivot으로 나눠 넘치면 결과 가드로 거부한다', () => {
    expect(() => mahalanobis3([3], [-1e308], [[0.00003]])).toThrow(/forward solve result at \(0\) must be finite/);
  });

  test('제곱 편차의 합이 넘치면 합 가드로 거부한다', () => {
    expect(() =>
      mahalanobis3(
        [3, 3e-162, -8.988465674311579e307],
        [-1e308, 1.3e154, 5e-324],
        [
          [1e308, 0.5, 1e154],
          [0.5, 2, 2],
          [1e154, 2, 1e77],
        ]
      )
    ).toThrow(/mahalanobis squared sum must be finite/);
  });
});

describe('PCA 가드', () => {
  test('pca는 useCorrelation에서 분산이 subnormal로 나뉘어 0이 되면 표준편차 가드로 거부한다', () => {
    expect(() => pca([[-3e-162], [-0], [0]], { useCorrelation: true })).toThrow(
      /variable\[0\] stddev must be finite and non-zero/
    );
  });

  test('pca는 고유값 합이 넘치면 거부한다', () => {
    const a = 1.09e154;
    const c = [a, -0.5 * a, -0.5 * a];
    const data = [
      [c[0], c[2], c[1]],
      [c[1], c[0], c[2]],
      [c[2], c[1], c[0]],
    ] as number[][];
    expect(() => pca(data, { mode: 'sample' })).toThrow(/explainedVariance total must be finite/);
  });

  test('pca는 epsilon이 0일 때 수치 오차로 음수 고유값이 생기면 undefined를 돌려준다', () => {
    const data = [
      [1, 1, 1],
      [5, 0.1, 0.01],
      [-0.2, 0.7, 5],
    ];
    expect(pca(data, { epsilon: 0 })).toBeUndefined();
  });

  test('reduceDimensions는 분해가 undefined면 거부한다', () => {
    const data = [
      [1, 1, 1],
      [5, 0.1, 0.01],
      [-0.2, 0.7, 5],
    ];
    expect(() => reduceDimensions(data, { dimensions: 1, epsilon: 0 })).toThrow(/could not project/);
  });
});

describe('최소제곱 가드', () => {
  test('계수가 작은 대각으로 나눠 넘치면 계수 가드로 거부한다', () => {
    expect(() => solveOverdeterminedSystem([[5e-324]], [1], { epsilon: 0 })).toThrow(
      /non-finite coefficient at index 0/
    );
  });

  test('잔차 항이 넘치면 항 가드로 거부한다', () => {
    expect(() => solveOverdeterminedSystem([[7]], [MAX], { epsilon: 1e-12 })).toThrow(
      /residual produced non-finite intermediate at row 0, column 0/
    );
  });

  test('잔차 누적이 넘치면 누적 가드로 거부한다', () => {
    expect(() =>
      solveOverdeterminedSystem(
        [
          [2, -1e103],
          [1, 2],
        ],
        [-MAX, 1e200],
        { epsilon: 0 }
      )
    ).toThrow(/residual accumulator overflowed at row \d/);
  });

  test('잔차 노름이 넘치면 결과 가드로 거부한다', () => {
    expect(() => solveOverdeterminedSystem([[1e155], [7], [-1]], [1e-200, MAX, -1e308], { epsilon: 0 })).toThrow(
      /residual produced non-finite result/
    );
  });
});
