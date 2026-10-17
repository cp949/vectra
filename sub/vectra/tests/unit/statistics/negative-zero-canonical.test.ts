/**
 * statistics 결과의 `-0` 정리 테스트.
 *
 * 검증 항목:
 *  1. 음수 부호가 0으로 무너진 결과(`-0`)는 `+0`으로 돌려준다.
 *  2. 입력의 `-0`이 그대로 결과에 새지 않는다.
 *
 * 설계 메모:
 *  - `toBe(0)`은 `Object.is`로 비교해 `-0`을 거른다.
 *  - 음수 부호는 나눗셈 underflow(`-5e-324 / 2`가 `-0`)나 입력 `-0`에서 생긴다.
 */
import { describe, expect, test } from 'vitest';
import { correlation } from '../../../src/statistics/correlation';
import { covariance } from '../../../src/statistics/covariance';
import { covarianceMatrix } from '../../../src/statistics/covariance-matrix';
import { histogramBinEdges } from '../../../src/statistics/histogram-bin-edges';
import { pca } from '../../../src/statistics/pca';
import { whiten } from '../../../src/statistics/whiten';

describe('스칼라 결과', () => {
  test('covariance는 음의 subnormal 곱합을 나눠 -0이 되면 0을 돌려준다', () => {
    expect(covariance([0, 2], [-0, -5e-324])).toBe(0);
  });

  test('correlation은 음의 subnormal 곱합을 나눠 -0이 되면 0을 돌려준다', () => {
    expect(correlation([0.00001, -1e-160, 0, 0.00003, 1], [1.5e-162, 1e153, -1e153, 1e-200, -0])).toBe(0);
  });
});

describe('행렬 결과', () => {
  test('covarianceMatrix는 음의 subnormal 공분산이 -0이 되면 0을 돌려준다', () => {
    const result = covarianceMatrix([
      [-5e-324, 2],
      [0, 3e-162],
    ]);
    expect(result[0][1]).toBe(0);
    expect(result[1][0]).toBe(0);
  });

  test('whiten은 입력 -0에서 생긴 -0을 0으로 정리한다', () => {
    const result = whiten([[-0], [7], [1e-102], [-7]]);
    expect(result[0][0]).toBe(0);
  });
});

describe('PCA 평균', () => {
  test('pca는 음의 subnormal 합을 나눠 평균이 -0이 되면 0을 돌려준다', () => {
    const result = pca([[-5e-324], [0]]);
    expect(result?.means[0]).toBe(0);
  });
});

describe('히스토그램 경계', () => {
  test('histogramBinEdges는 최솟값이 -0이면 첫 경계를 0으로 정리한다', () => {
    expect(histogramBinEdges([7, -0], { bins: 1 })[0]).toBe(0);
  });

  test('histogramBinEdges는 range 최댓값이 -0이면 마지막 경계를 0으로 정리한다', () => {
    const edges = histogramBinEdges([-1], { bins: 2, range: [-1, -0] });
    expect(edges[2]).toBe(0);
  });
});
