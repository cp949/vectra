/**
 * statistics pca-eigen.internal 단위 테스트.
 *
 * PCA eigen postprocess가 descending order, rank, sign convention을 독립 helper로 유지하는지 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { orderEigenDescending } from '../../../src/statistics/pca-eigen.internal';

describe('statistics pca-eigen.internal — orderEigenDescending', () => {
  test('eigenvalue를 descending 정렬하고 component row sign을 양수 convention으로 맞춘다', () => {
    const ordered = orderEigenDescending(
      {
        values: [1, 3, 0],
        vectors: [
          [0, -1, 0],
          [1, 0, 0],
          [0, 0, 1],
        ],
      },
      3,
      1e-9
    );

    expect(ordered).toBeDefined();
    if (ordered === undefined) return;
    expect(ordered.values).toEqual([3, 1, 0]);
    expect(ordered.rank).toBe(2);
    expect(ordered.components).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });
});
