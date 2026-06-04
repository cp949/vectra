import { assertNonNegativeSafeInteger } from './histogram.internal';
import { commitSequenceInto } from './sequence-commit.internal';
import type { BincountOptions } from './types';
import { assertValuesArray } from './validate.internal';

/**
 * `labels`의 빈도 count를 `out`에 기록한다.
 *
 * 각 label은 non-negative safe integer여야 한다. non-integer, 음수, `Infinity`, `NaN`,
 * `Number.MAX_SAFE_INTEGER` 초과는 모두 `RangeError`. `labels`가 array가 아니거나 entry가 number가 아니면
 * `TypeError`(타입 위반은 `TypeError`, 값 위반은 `RangeError`로 분기).
 *
 * `options.minLength`는 결과 배열의 최소 길이다. number가 아니면 `TypeError`, non-negative safe integer가
 * 아니면 `RangeError`.
 * 결과 length는 `max(minLength, maxLabel + 1)`(빈 입력이면 `minLength`)이고, `minLength` 미지정 + 빈 입력이면
 * `[]`다. `minLength`를 넘어서는 인덱스의 count는 실제 빈도로 채우고, label에 한 번도 등장하지 않은 슬롯은 `0`이다.
 *
 * 누적 count가 safe integer 범위 벗어나면 `RangeError`.
 *
 * validation 또는 산술 실패 시 `out`은 호출 전 상태를 유지한다(모든 산술이 끝난 뒤 단일 commit). `out`과
 * `labels`가 같은 배열이어도 안전하다. 결과 entry는 non-negative safe integer이고 `-0`은 발생하지 않지만
 * `commitSequenceInto`가 일관성을 위해 `0`으로 canonicalize한다. 반환값은 `out`이다.
 *
 * @param out count를 기록할 writable storage. 호출 전 length는 무시되고 commit 후 결과 length를 가진다.
 * @param labels count 대상 non-negative safe integer 배열. mutate하지 않는다.
 * @param options 옵션. `minLength` 기본 미지정.
 */
export function bincountInto(out: number[], labels: readonly number[], options?: BincountOptions): number[] {
  assertValuesArray(labels, 'labels');

  let minLength = 0;
  if (options?.minLength !== undefined) {
    if (typeof options.minLength !== 'number') {
      throw new TypeError(`options.minLength must be a number, got ${typeof options.minLength}`);
    }
    assertNonNegativeSafeInteger(options.minLength, 'options.minLength');
    minLength = options.minLength;
  }

  let maxLabel = -1;
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    if (typeof label !== 'number') {
      throw new TypeError(`labels[${i}] must be a number, got ${typeof label}`);
    }
    // bitwise int32 coercion 회피: assertNonNegativeSafeInteger는 Number.isSafeInteger 기반으로 검증한다.
    assertNonNegativeSafeInteger(label, `labels[${i}]`);
    if (label > maxLabel) maxLabel = label;
  }

  const resultLength = Math.max(minLength, maxLabel + 1);
  const counts = new Array<number>(resultLength);
  for (let i = 0; i < resultLength; i++) counts[i] = 0;

  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const next = counts[label] + 1;
    if (!Number.isSafeInteger(next)) {
      throw new RangeError(`bincount overflow at label ${label}, got ${String(next)}`);
    }
    counts[label] = next;
  }

  commitSequenceInto(out, counts);
  return out;
}
