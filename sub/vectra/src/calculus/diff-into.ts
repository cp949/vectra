import { commitSequenceInto } from './sequence-commit.internal';
import { assertValuesEntriesFinite, assertValuesIsArray } from './sequence-validate.internal';
import { assertNonNegativeSafeInteger } from './validate.internal';

/**
 * sequence `values`의 `order`차 forward discrete difference를 `out`에 기록한다.
 *
 * `values`는 array여야 한다. array가 아니면 `TypeError`.
 * `order` 미지정 시 기본 `1`. 지정 시 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * `values`의 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `order === 0`은 `values`의 entry-wise copy를 기록한다(identity가 아닌 copy이므로 `out`은 `values`와
 * 다른 instance라면 caller의 `values` 인스턴스를 공유하지 않는다). order 0 분기도 fresh temp array에
 * 복사 후 commit하므로 `out === values` aliasing이 안전하다. order 0 copy 결과도 `-0`은 `0`으로
 * canonicalize한다(commit 단계 공통 정책).
 * `order === k > 0`은 forward difference를 `k`번 적용한다. 한 번 적용 시 result length는
 * `max(0, input.length - 1)`이며 `result[i] = input[i + 1] - input[i]`이다. 따라서 최종 length는
 * `max(0, values.length - order)`이다.
 * 매 단계 subtraction 결과는 finite여야 한다. 위반 시 `RangeError`. 결과 entry의 `-0`은 `0`으로
 * canonicalize한다.
 * validation 또는 계산이 실패하면 `out`은 호출 전 상태 그대로 남는다(모든 산술이 끝난 뒤 commit).
 * `out === values` aliasing도 안전하다. 매 pass는 fresh temp array에서 끝나고 최종 commit만 `out`을
 * 수정한다.
 *
 * @param out difference sequence를 기록할 writable storage. commit 후 정확한 length를 갖는다.
 * @param values difference를 적용할 sequence. 호출 후에도 mutate되지 않는다(단 `out`과 같은 instance면 commit에 의해 덮어쓰여진다).
 * @param order 적용할 forward difference 차수. 기본 `1`. 비음의 safe integer.
 */
export function diffInto(out: number[], values: readonly number[], order?: number): number[] {
  assertValuesIsArray(values, 'values');
  const k = order ?? 1;
  assertNonNegativeSafeInteger(k, 'order');
  assertValuesEntriesFinite(values, 'values');

  // order 0: fresh copy. commitSequenceInto가 out.length = 0을 하기 전에 fresh array에 복사가
  // 끝나므로 out === values 케이스에서도 안전하다.
  if (k === 0) {
    commitSequenceInto(out, values.slice());
    return out;
  }

  // forward difference를 k번 적용. 매 pass는 fresh array에서 진행한다.
  let cur: number[] = values.slice();
  for (let pass = 0; pass < k; pass++) {
    const nextLen = cur.length === 0 ? 0 : cur.length - 1;
    const next = new Array<number>(nextLen);
    for (let i = 0; i < nextLen; i++) {
      const d = cur[i + 1] - cur[i];
      if (!Number.isFinite(d)) {
        throw new RangeError(`diff pass ${pass + 1} entry at index ${i} must be finite, got ${String(d)}`);
      }
      next[i] = d;
    }
    cur = next;
  }

  commitSequenceInto(out, cur);
  return out;
}
