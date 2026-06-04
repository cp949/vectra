import { commitSequenceInto } from './sequence-commit.internal';
import { assertValuesEntriesFinite, assertValuesIsArray } from './sequence-validate.internal';

/**
 * sequence `values`의 cumulative sum을 `out`에 기록한다.
 *
 * `values`는 array여야 한다. array가 아니면 `TypeError`.
 * `values`의 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `values.length === 0`은 `[]`.
 * `values.length >= 1`은 length가 `values.length`인 sequence를 만든다.
 * `result[0] = values[0]`, `result[i] = result[i-1] + values[i]`.
 * 매 partial sum은 finite여야 한다. 위반 시 `RangeError`(`Number.MAX_VALUE` 두 entry 누적 등에서
 * Infinity가 될 수 있다). 결과 entry의 `-0`은 `0`으로 canonicalize한다.
 * validation 또는 계산이 실패하면 `out`은 호출 전 상태 그대로 남는다(모든 산술이 끝난 뒤 commit).
 * `out === values` aliasing도 안전하다. fresh temp array에서 산술을 끝낸 뒤 commit한다.
 *
 * @param out cumulative sum sequence를 기록할 writable storage. commit 후 정확한 length(`values.length`)를 갖는다.
 * @param values 누적 합산을 적용할 sequence. 호출 후에도 mutate되지 않는다(단 `out`과 같은 instance면 commit에 의해 덮어쓰여진다).
 */
export function cumulativeSumInto(out: number[], values: readonly number[]): number[] {
  assertValuesIsArray(values, 'values');
  assertValuesEntriesFinite(values, 'values');

  const n = values.length;
  if (n === 0) {
    out.length = 0;
    return out;
  }

  const temp = new Array<number>(n);
  let acc = values[0];
  temp[0] = acc;
  for (let i = 1; i < n; i++) {
    acc += values[i];
    if (!Number.isFinite(acc)) {
      throw new RangeError(`cumulative sum at index ${i} must be finite, got ${String(acc)}`);
    }
    temp[i] = acc;
  }

  commitSequenceInto(out, temp);
  return out;
}
