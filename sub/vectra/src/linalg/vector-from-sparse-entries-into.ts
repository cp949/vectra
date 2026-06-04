import type { SparseVectorEntry, VecWritable } from './types';
import { assertFiniteNumber, assertNonNegativeSafeInteger } from './validate.internal';

/**
 * `entries`로부터 길이 `dimension`의 dense vector를 재구성해 `out`에 기록한다.
 *
 * `dimension`은 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * 각 entry의 `index`는 `Number.isInteger(index) && 0 <= index < dimension`이어야 한다. 위반 시 `RangeError`.
 * 각 entry의 `value`는 finite number여야 한다. 위반 시 `RangeError`.
 * 같은 `index`가 두 번 등장하면 `RangeError`(자동 합산하지 않는다).
 * `out.length`가 `dimension`보다 작으면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 수정되지 않는다(모든 validation이 성공한 뒤에만 mutate).
 * 성공 시 `out[0..dimension)`을 0으로 채운 뒤 entry를 기록하고 `out.length`는 `dimension`으로 truncate된다.
 *
 * @param out vector를 기록할 writable storage
 * @param dimension 재구성할 dense vector의 길이. 비음의 safe integer.
 * @param entries sparse vector entry 목록. 같은 `index`가 두 번 등장하면 `RangeError`.
 */
export function vectorFromSparseEntriesInto<Out extends VecWritable>(
  out: Out,
  dimension: number,
  entries: readonly SparseVectorEntry[]
): Out {
  assertNonNegativeSafeInteger(dimension, 'dimension');
  const seen = new Set<number>();
  for (let k = 0; k < entries.length; k++) {
    const { index, value } = entries[k];
    if (!Number.isInteger(index) || index < 0 || index >= dimension) {
      throw new RangeError(`entries[${k}].index must be an integer in [0, ${dimension}), got ${String(index)}`);
    }
    assertFiniteNumber(value, `entries[${k}].value`);
    if (seen.has(index)) {
      throw new RangeError(`entries[${k}].index ${index} is a duplicate`);
    }
    seen.add(index);
  }
  if (out.length < dimension) {
    throw new RangeError(`out capacity (${out.length}) is less than dimension (${dimension})`);
  }
  for (let i = 0; i < dimension; i++) {
    out[i] = 0;
  }
  for (let k = 0; k < entries.length; k++) {
    const { index, value } = entries[k];
    out[index] = value;
  }
  out.length = dimension;
  return out;
}
