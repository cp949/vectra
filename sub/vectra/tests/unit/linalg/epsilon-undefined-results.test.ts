/**
 * epsilon 허용오차 때문에 undefined를 돌려주는 경로를 확인하는 테스트.
 * 입력은 모두 유한값이고 에러가 아니라 undefined로 끝나는 수치 경계를 다룬다.
 * 경계값은 부동소수점 반올림 결과에 의존하므로 입력을 그대로 고정한다.
 */
import { describe, expect, test } from 'vitest';
import { calculateEigenvalues } from '../../../src/linalg/calculate-eigenvalues';
import { eig } from '../../../src/linalg/eig';
import { pseudoInverse } from '../../../src/linalg/pseudo-inverse';
import { solveWithLuFactorization } from '../../../src/linalg/solve-with-lu-factorization';

describe('eig의 고유벡터 실패', () => {
  test('고유값이 서로 달라도 영공간 벡터를 못 구하면 undefined를 반환한다', () => {
    const matrix = [
      [20000, -1.5],
      [-0.5, 2.5],
    ];
    // 고유값은 약 20000과 2.5라 calculateEigenvalues는 둘을 돌려준다.
    expect(calculateEigenvalues(matrix, { epsilon: 0 })).toHaveLength(2);
    // 반올림된 lambda로 만든 (A - lambda I)가 epsilon 0에서 최대 rank라 영공간이 비어 있다.
    expect(eig(matrix, { epsilon: 0 })).toBeUndefined();
  });

  test('상삼각 행렬도 영공간 벡터를 못 구하면 undefined를 반환한다', () => {
    const matrix = [
      [-150000000, 0.02],
      [0, 1e-8],
    ];
    expect(calculateEigenvalues(matrix, { epsilon: 1e-12 })).toHaveLength(2);
    expect(eig(matrix, { epsilon: 1e-12 })).toBeUndefined();
  });
});

describe('eig의 영공간 벡터 norm 검사', () => {
  test('epsilon이 영공간 벡터의 norm 이상이면 undefined를 반환한다', () => {
    const matrix = [
      [0, 0],
      [2, 2],
    ];
    // 고유값은 0과 2다. lambda = 2의 영공간 벡터는 (0, 1)이라 norm이 1이다.
    expect(calculateEigenvalues(matrix, { epsilon: 1 })).toEqual([2, 0]);
    // 단위 길이 벡터는 norm이 epsilon 1 이하라 수치 실패로 본다.
    expect(eig(matrix, { epsilon: 1 })).toBeUndefined();
  });
});

describe('pseudoInverse의 특이값 검사', () => {
  test('A^T A 고유값이 -epsilon보다 작게 반올림되면 undefined를 반환한다', () => {
    // 1x2 행렬은 rank 1이라 A^T A의 한 고유값이 0이어야 한다. 반올림 오차가 -1e-300 아래로 내려간다.
    expect(pseudoInverse([[0.015, -200]], { epsilon: 1e-300 })).toBeUndefined();
  });
});

describe('solveWithLuFactorization의 전진 대입', () => {
  test('epsilon이 단위 대각 이상이면 전진 대입이 특이로 판정해 undefined를 반환한다', () => {
    // epsilon 1이면 대각 1이 단위 대각 검사를 통과하고, 전진 대입에서는 |1| <= epsilon이라 특이다.
    const factorization = { lower: [[1]], upper: [[1]], permutation: [0], swaps: 0 };
    expect(solveWithLuFactorization(factorization, [1], { epsilon: 1 })).toBeUndefined();
  });
});
