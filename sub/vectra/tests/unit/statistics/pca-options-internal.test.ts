/**
 * statistics pca-options.internal 단위 테스트.
 *
 * resolvePCAOptions가 useCorrelation 검증과 PCA 결과 모양을 소유하는지 검증한다.
 * 반복 옵션 세 필드의 default와 값 검증은 internal iteration-options 테스트가 다룬다.
 */

import { describe, expect, test } from 'vitest';
import {
  DEFAULT_ITERATION_EPSILON,
  DEFAULT_ITERATION_MAX,
  DEFAULT_ITERATION_TOLERANCE,
} from '../../../src/internal/iteration-options';
import { resolvePCAOptions } from '../../../src/statistics/pca-options.internal';

describe('statistics pca-options.internal — resolvePCAOptions', () => {
  test('undefined options는 반복 옵션 default와 useCorrelation false를 채운다', () => {
    expect(resolvePCAOptions(undefined, 'options')).toEqual({
      maxIterations: DEFAULT_ITERATION_MAX,
      tolerance: DEFAULT_ITERATION_TOLERANCE,
      epsilon: DEFAULT_ITERATION_EPSILON,
      useCorrelation: false,
    });
  });

  test('지정한 옵션은 그대로 결과에 담는다', () => {
    expect(
      resolvePCAOptions({ useCorrelation: true, maxIterations: 7, tolerance: 0.5, epsilon: 0.25 }, 'options')
    ).toEqual({ maxIterations: 7, tolerance: 0.5, epsilon: 0.25, useCorrelation: true });
  });

  test('useCorrelation은 boolean만 허용한다', () => {
    expect(() => resolvePCAOptions({ useCorrelation: 'yes' as never }, 'options')).toThrow(
      'options.useCorrelation must be a boolean, got yes'
    );
  });

  test('useCorrelation 위반은 반복 옵션 위반보다 먼저 던진다', () => {
    expect(() =>
      resolvePCAOptions({ useCorrelation: 'yes' as never, maxIterations: 0, tolerance: -1, epsilon: -1 }, 'options')
    ).toThrow('options.useCorrelation must be a boolean, got yes');
  });

  test('반복 옵션 위반은 name을 접두사로 하는 RangeError로 던진다', () => {
    expect(() => resolvePCAOptions({ maxIterations: 0 }, 'opts')).toThrow(
      new RangeError('opts.maxIterations must be a positive safe integer, got 0')
    );
  });
});
