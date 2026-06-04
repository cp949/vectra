import type { SparseOptions, SparseVectorEntry, VecLike } from './types';
import { vectorSparseEntriesInto } from './vector-sparse-entries-into';

/**
 * vector의 `Math.abs(value) > epsilon`인 entry만 새 `SparseVectorEntry[]`로 반환한다.
 *
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `options.epsilon`은 비음의 finite number여야 한다. 위반 시 `RangeError`.
 *
 * @param vector sparse 표현으로 추출할 vector
 * @param options sparse 변환 옵션. `epsilon` 미지정 시 exact zero(`0`).
 */
export function vectorSparseEntries(vector: VecLike, options?: SparseOptions): SparseVectorEntry[] {
  return vectorSparseEntriesInto([], vector, options);
}
