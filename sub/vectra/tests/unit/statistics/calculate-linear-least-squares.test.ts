/**
 * statistics.calculateLinearLeastSquares — statistics-facing least-squares wrapper.
 *
 * solveOverdeterminedSystem과 동일 결과(coefficients/residual/rank), 동일 실패 분기
 * (rank-deficient undefined, invalid input RangeError/TypeError), signed-zero 정규화,
 * error message의 data/template 인자 이름을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { calculateLinearLeastSquares } from '../../../src/statistics/calculate-linear-least-squares';
import { solveOverdeterminedSystem } from '../../../src/statistics/solve-overdetermined-system';

describe('calculateLinearLeastSquares — solveOverdeterminedSystem과 동일 결과', () => {
  test('full-rank exact fit은 동일한 coefficients/residual/rank를 반환한다', () => {
    const data = [
      [1, 0],
      [0, 1],
      [1, 1],
    ];
    const template = [1, 2, 3];
    const aliasResult = calculateLinearLeastSquares(data, template);
    const coreResult = solveOverdeterminedSystem(data, template);
    expect(aliasResult).toEqual(coreResult);
  });

  test('noisy fit은 동일한 coefficients/residual/rank를 반환한다', () => {
    const data = [
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ];
    const template = [1.0, 3.1, 4.9, 7.0, 9.05];
    const aliasResult = calculateLinearLeastSquares(data, template);
    const coreResult = solveOverdeterminedSystem(data, template);
    expect(aliasResult).toEqual(coreResult);
  });

  test('rank-deficient 입력은 동일하게 undefined를 반환한다', () => {
    const data = [
      [1, 1],
      [2, 2],
      [3, 3],
    ];
    const template = [1, 2, 3];
    expect(calculateLinearLeastSquares(data, template)).toBeUndefined();
    expect(solveOverdeterminedSystem(data, template)).toBeUndefined();
  });

  test('빈 입력 A = [], b = []는 동일한 성공 결과를 반환한다', () => {
    expect(calculateLinearLeastSquares([], [])).toEqual(solveOverdeterminedSystem([], []));
  });

  test('m x 0 zero-column은 동일하게 residual = ||template||₂를 반환한다', () => {
    const aliasResult = calculateLinearLeastSquares([[], []], [3, 4]);
    expect(aliasResult).toBeDefined();
    if (!aliasResult) return;
    expect(aliasResult.coefficients).toEqual([]);
    expect(aliasResult.residual).toBeCloseTo(5, 12);
    expect(aliasResult.rank).toBe(0);
  });

  test('options.epsilon이 동일하게 전달된다', () => {
    const tiny = 1e-6;
    const data = [
      [1, 1 + tiny],
      [2, 2 + tiny],
      [3, 3 + tiny],
    ];
    const template = [1, 2, 3];
    expect(calculateLinearLeastSquares(data, template, { epsilon: 1e-3 })).toBeUndefined();
  });

  test('signed-zero coefficient도 +0으로 정규화한다', () => {
    const result = calculateLinearLeastSquares(
      [
        [1, 0],
        [0, 1],
        [1, 1],
      ],
      [0, 0, 0]
    );
    expect(result).toBeDefined();
    if (!result) return;
    expect(Object.is(result.coefficients[0], -0)).toBe(false);
    expect(Object.is(result.coefficients[1], -0)).toBe(false);
  });
});

describe('calculateLinearLeastSquares — 잘못된 입력은 RangeError/TypeError', () => {
  test('epsilon NaN이면 RangeError', () => {
    expect(() => calculateLinearLeastSquares([[1]], [1], { epsilon: Number.NaN })).toThrow(RangeError);
  });

  test('data가 non-array이면 TypeError', () => {
    expect(() => calculateLinearLeastSquares(null as unknown as number[][], [])).toThrow(TypeError);
  });

  test('template이 non-array이면 TypeError', () => {
    expect(() => calculateLinearLeastSquares([[1]], null as unknown as number[])).toThrow(TypeError);
  });

  test('data ragged면 RangeError', () => {
    expect(() => calculateLinearLeastSquares([[1, 2], [3]], [1, 2])).toThrow(RangeError);
  });

  test('template.length가 data.rows와 다르면 RangeError', () => {
    expect(() =>
      calculateLinearLeastSquares(
        [
          [1, 0],
          [0, 1],
          [1, 1],
        ],
        [1, 2]
      )
    ).toThrow(RangeError);
  });

  test('data.rows < data.columns면 RangeError', () => {
    expect(() =>
      calculateLinearLeastSquares(
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
        [1, 2]
      )
    ).toThrow(RangeError);
  });

  test('data entry가 non-finite이면 RangeError', () => {
    expect(() =>
      calculateLinearLeastSquares(
        [
          [1, 0],
          [0, Number.NaN],
          [1, 1],
        ],
        [1, 2, 3]
      )
    ).toThrow(RangeError);
  });

  test('template entry가 non-finite이면 RangeError', () => {
    expect(() =>
      calculateLinearLeastSquares(
        [
          [1, 0],
          [0, 1],
          [1, 1],
        ],
        [1, Number.NaN, 3]
      )
    ).toThrow(RangeError);
  });

  test('error message에 인자 이름 data/template이 노출된다', () => {
    expect(() => calculateLinearLeastSquares(null as unknown as number[][], [])).toThrow(/^data\s/);
    expect(() => calculateLinearLeastSquares([[1]], null as unknown as number[])).toThrow(/^template\s/);
  });
});
