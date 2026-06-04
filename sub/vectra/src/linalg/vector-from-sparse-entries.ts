import type { SparseVectorEntry } from './types';
import { assertNonNegativeSafeInteger } from './validate.internal';
import { vectorFromSparseEntriesInto } from './vector-from-sparse-entries-into';

/**
 * `entries`로부터 길이 `dimension`의 dense vector를 새 `number[]`로 반환한다.
 *
 * `dimension`은 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * 각 entry의 `index`는 `Number.isInteger(index) && 0 <= index < dimension`이어야 한다. 위반 시 `RangeError`.
 * 각 entry의 `value`는 finite number여야 한다. 위반 시 `RangeError`.
 * 같은 `index`가 두 번 등장하면 `RangeError`(자동 합산하지 않는다).
 *
 * @param dimension 재구성할 dense vector의 길이. 비음의 safe integer.
 * @param entries sparse vector entry 목록. 같은 `index`가 두 번 등장하면 `RangeError`.
 */
export function vectorFromSparseEntries(dimension: number, entries: readonly SparseVectorEntry[]): number[] {
  assertNonNegativeSafeInteger(dimension, 'dimension');
  const out: number[] = new Array(dimension);
  return vectorFromSparseEntriesInto(out, dimension, entries);
}
