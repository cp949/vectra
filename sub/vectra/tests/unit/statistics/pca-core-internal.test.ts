/**
 * statistics pca-core.internal 단위 테스트.
 *
 * computePcaCore가 materialize 이후 PCA 계산만 담당하는 독립 helper인지 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { computePcaCore } from '../../../src/statistics/pca-core.internal';
import { resolvePCAOptions } from '../../../src/statistics/pca-options.internal';

describe('statistics pca-core.internal — computePcaCore', () => {
  test('materialized variables에서 PCA core 결과를 계산한다', () => {
    const variables = [
      [1, 2, 3, 4],
      [1, 2, 3, 4],
    ];
    const result = computePcaCore(variables, 2, 4, 'population', resolvePCAOptions(undefined, 'options'));

    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.rank).toBe(1);
    expect(result.means).toEqual([2.5, 2.5]);
    expect(result.components[0][0]).toBeCloseTo(Math.SQRT1_2, 10);
    expect(result.components[0][1]).toBeCloseTo(Math.SQRT1_2, 10);
    expect(result.explainedVarianceRatio).toEqual([1]);
  });
});
