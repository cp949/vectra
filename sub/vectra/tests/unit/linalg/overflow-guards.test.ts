/**
 * 누적·나눗셈 중간값이 overflow할 때 linalg가 던지는 RangeError를 확인하는 테스트.
 * 입력은 모두 유한값이고 MAX_VALUE 규모의 원소로 중간값만 범위를 넘게 만든다.
 * 메시지 정규식으로 어느 가드가 던졌는지까지 고정한다.
 */
import { describe, expect, test } from 'vitest';
import { calculateEigenvalues } from '../../../src/linalg/calculate-eigenvalues';
import { choleskyDecomposition } from '../../../src/linalg/cholesky-decomposition';
import { determinant } from '../../../src/linalg/determinant';
import { distance } from '../../../src/linalg/distance';
import { eig } from '../../../src/linalg/eig';
import { exp } from '../../../src/linalg/exp';
import { pseudoInverse } from '../../../src/linalg/pseudo-inverse';
import { qrDecomposition } from '../../../src/linalg/qr-decomposition';
import { reducedRowEchelonForm } from '../../../src/linalg/reduced-row-echelon-form';
import { solveByForwardSubstitution } from '../../../src/linalg/solve-by-forward-substitution';
import { solveUnderdeterminedSystem } from '../../../src/linalg/solve-underdetermined-system';
import { solveWithCholeskyDecomposition } from '../../../src/linalg/solve-with-cholesky-decomposition';

const BIG = Number.MAX_VALUE;

describe('qrDecomposition의 overflow', () => {
  test('투영 계수의 내적 누적이 overflow하면 RangeError를 던진다', () => {
    // 첫 열의 단위벡터가 (0.707, 0.707)이라 둘째 열 (MAX, MAX)와의 내적이 1.41·MAX가 된다.
    expect(() =>
      qrDecomposition([
        [1, BIG],
        [1, BIG],
      ])
    ).toThrow(/^QR decomposition produced non-finite intermediate at projection step, got Infinity$/);
  });

  test('투영을 뺀 값이 overflow하면 RangeError를 던진다', () => {
    // 첫 단위벡터 (0.6, -0.8)에 대한 계수가 -0.2·MAX라 첫 원소가 1.12·MAX가 된다.
    expect(() =>
      qrDecomposition([
        [3, BIG],
        [-4, BIG],
      ])
    ).toThrow(/^QR decomposition produced non-finite value at \[0\]\[1\], got Infinity$/);
  });
});

describe('exp의 overflow', () => {
  test('행 절대합이 overflow하면 무한대 노름 RangeError를 던진다', () => {
    expect(() =>
      exp([
        [BIG, BIG],
        [0, 0],
      ])
    ).toThrow(/^matrix infinity norm overflow at row 0, column 1$/);
  });
});

describe('가우스 소거의 overflow', () => {
  test('피벗 행을 피벗으로 나눈 값이 overflow하면 RangeError를 던진다', () => {
    expect(() => reducedRowEchelonForm([[0.5, BIG]])).toThrow(
      /^matrix elimination produced non-finite pivot row entry at \[0\]\[1\], got Infinity$/
    );
  });
});

describe('전진 대입의 overflow', () => {
  test('우변에서 곱을 빼는 누적이 overflow하면 RangeError를 던진다', () => {
    // x0 = 1이다. 둘째 행은 b1 - (-MAX)·1 = MAX + MAX가 되어 범위를 넘는다.
    expect(() =>
      solveByForwardSubstitution(
        [
          [1, 0],
          [-BIG, 1],
        ],
        [1, BIG]
      )
    ).toThrow(/^L substitution accumulator overflowed at row 1, got Infinity$/);
  });
});

describe('determinant의 0 정규화', () => {
  test('행 교환 뒤 대각 곱이 underflow로 0이 되면 -0이 아니라 +0이다', () => {
    const det = determinant([
      [0, 1e-200],
      [1e-200, 0],
    ]);
    expect(Object.is(det, 0)).toBe(true);
  });

  test('epsilon 0이면 피벗이 살아 있어도 곱이 underflow로 0이 되고 부호와 무관하게 +0이다', () => {
    // 행 교환이 없는 경우다. 피벗 1e-200 두 개의 곱 1e-400은 0으로 underflow한다.
    const noSwap = determinant(
      [
        [1e-200, 0],
        [0, 1e-200],
      ],
      { epsilon: 0 }
    );
    expect(Object.is(noSwap, 0)).toBe(true);
    // 행 교환이 있으면 -product 경로로 가서 -0이 되기 쉽다. 가드가 먼저 +0을 돌려준다.
    const swapped = determinant(
      [
        [0, 1e-200],
        [1e-200, 0],
      ],
      { epsilon: 0 }
    );
    expect(Object.is(swapped, 0)).toBe(true);
  });
});

describe('distance의 overflow', () => {
  test('성분 차이가 overflow하면 RangeError를 던진다', () => {
    expect(() => distance([BIG], [-BIG])).toThrow(/^a\[0\] - b\[0\] must be a finite number, got Infinity$/);
  });
});

describe('choleskyDecomposition의 overflow', () => {
  test('대각 원소에서 선행 항을 뺀 나머지가 overflow하면 RangeError를 던진다', () => {
    // L10 = 1e154라 L10² = 1e308이다. -MAX에서 이를 빼면 -Infinity가 된다.
    expect(() =>
      choleskyDecomposition([
        [1, 1e154],
        [1e154, -BIG],
      ])
    ).toThrow(/^choleskyDecomposition produced non-finite remainder at \[1\]\[1\], got -Infinity$/);
  });

  test('대각 원소로 나눈 비대각 값이 overflow하면 RangeError를 던진다', () => {
    // L00 = sqrt(1e-8) = 1e-4라 MAX / 1e-4는 범위를 넘는다.
    expect(() =>
      choleskyDecomposition([
        [1e-8, BIG],
        [BIG, 1],
      ])
    ).toThrow(/^choleskyDecomposition produced non-finite value at \[1\]\[0\], got Infinity$/);
  });
});

describe('2x2 고유값의 overflow', () => {
  test('판별식이 overflow하면 eig와 calculateEigenvalues가 RangeError를 던진다', () => {
    // 비대칭이라 닫힌 형식 경로를 탄다. 4·(ad - bc)에서 -MAX·1 항이 overflow한다.
    const matrix = [
      [0.5, -BIG],
      [1, -1],
    ];
    expect(() => eig(matrix)).toThrow(/^2x2 eigenvalue discriminant overflowed for matrix /);
    expect(() => calculateEigenvalues(matrix)).toThrow(/^2x2 eigenvalue discriminant overflowed for matrix /);
  });

  test('고유벡터 norm 제곱 누적이 overflow하면 RangeError를 던진다', () => {
    // lambda = 2에서 영공간 벡터가 (1, 0)이 아니라 1e300 규모 성분을 가져 제곱이 범위를 넘는다.
    expect(() =>
      eig([
        [2, 1e300],
        [0, 0],
      ])
    ).toThrow(/^eigenvector norm accumulator overflowed, got Infinity$/);
  });
});

describe('SVD 기반 함수의 overflow', () => {
  test('A^T A 누적이 overflow하면 pseudoInverse가 RangeError를 던진다', () => {
    // 1e154 * -MAX가 첫 행에서 바로 -Infinity가 된다.
    expect(() => pseudoInverse([[1e154, -1e154, -BIG]])).toThrow(
      /^SVD A\^T A accumulator overflowed at \[\d\]\[\d\], got -Infinity$/
    );
  });

  test('잔차 누적이 overflow하면 solveUnderdeterminedSystem이 RangeError를 던진다', () => {
    expect(() => solveUnderdeterminedSystem([[1, 1e-8, 5e-324]], [BIG], { epsilon: 0 })).toThrow(
      /^residual accumulator overflowed at row 0, got Infinity$/
    );
  });

  test('후보 해 누적이 overflow하면 solveUnderdeterminedSystem이 RangeError를 던진다', () => {
    // A^+의 성분이 1e150이고 b가 1e160이라 곱이 범위를 넘는다.
    expect(() => solveUnderdeterminedSystem([[1e-150, 0]], [1e160], { epsilon: 0 })).toThrow(
      /^solveUnderdeterminedSystem candidate accumulator overflowed at row 0, got Infinity$/
    );
  });
});

describe('solveWithCholeskyDecomposition의 전치 대입 overflow', () => {
  test('전치 대입 누적이 overflow하면 RangeError를 던진다', () => {
    expect(() =>
      solveWithCholeskyDecomposition(
        {
          lower: [
            [2, 0],
            [1, -1],
          ],
        },
        [-BIG, 1e300],
        { epsilon: 0 }
      )
    ).toThrow(/transpose substitution accumulator overflowed at row \d, got -?Infinity$/);
  });

  test('전치 대입의 해 성분이 overflow하면 RangeError를 던진다', () => {
    expect(() =>
      solveWithCholeskyDecomposition(
        {
          lower: [
            [BIG, 0],
            [0.5, 5e-324],
          ],
        },
        [2, 5e-324],
        { epsilon: 0 }
      )
    ).toThrow(/transpose substitution produced non-finite solution entry at row \d, got -?Infinity$/);
  });
});
