/**
 * statistics pca-options.internal 단위 테스트.
 *
 * resolvePCAOptions가 PCA-specific 옵션의 default와 validation을 단독 helper로 유지하는지 검증한다.
 */

import { describe, expect, test } from 'vitest';
import {
  DEFAULT_PCA_EPSILON,
  DEFAULT_PCA_MAX_ITERATIONS,
  DEFAULT_PCA_TOLERANCE,
  resolvePCAOptions,
} from '../../../src/statistics/pca-options.internal';

describe('statistics pca-options.internal — resolvePCAOptions', () => {
  test('undefined options는 PCA default를 채운다', () => {
    expect(resolvePCAOptions(undefined, 'options')).toEqual({
      maxIterations: DEFAULT_PCA_MAX_ITERATIONS,
      tolerance: DEFAULT_PCA_TOLERANCE,
      epsilon: DEFAULT_PCA_EPSILON,
      useCorrelation: false,
    });
  });

  test('useCorrelation은 boolean만 허용한다', () => {
    expect(() => resolvePCAOptions({ useCorrelation: 'yes' as never }, 'options')).toThrow(
      'options.useCorrelation must be a boolean, got yes'
    );
  });
});
