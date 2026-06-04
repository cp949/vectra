import { commitSequenceInto } from './sequence-commit.internal';
import { assertFiniteNumber, assertNonNegativeSafeInteger } from './validate.internal';

/**
 * `start`부터 `step`을 더해 `count`개의 sample을 `out`에 기록한다.
 *
 * `start`/`step`은 finite number, `count`는 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * `step === 0`은 허용한다(모든 entry가 `start`).
 * `count === 0`은 `[]`. `count >= 1`이면 index `0`은 `start`, 이후 entry는 `start + step * index`다.
 * 산식 결과가 non-finite가 되면 `RangeError`.
 * validation 또는 계산이 실패하면 `out`은 호출 전 상태 그대로 남는다(모든 산술이 끝난 뒤 commit).
 * 성공 시 결과의 `-0`은 `0`으로 canonicalize한다. 반환값은 `out`.
 *
 * @param out sequence를 기록할 writable storage. 호출 전 length는 무시되고 commit 후 정확한 length를 갖는다.
 * @param start 첫 entry로 사용할 시작값. finite number.
 * @param step 각 entry에 누적할 step. finite number. `0` 허용.
 * @param count 생성할 sample 개수. 비음의 safe integer.
 */
export function stepsInto(out: number[], start: number, step: number, count: number): number[] {
  assertFiniteNumber(start, 'start');
  assertFiniteNumber(step, 'step');
  assertNonNegativeSafeInteger(count, 'count');

  if (count === 0) {
    out.length = 0;
    return out;
  }

  const temp = new Array<number>(count);
  temp[0] = start;
  for (let i = 1; i < count; i++) {
    const value = start + step * i;
    if (!Number.isFinite(value)) {
      throw new RangeError(`steps entry at index ${i} must be finite, got ${String(value)}`);
    }
    temp[i] = value;
  }

  commitSequenceInto(out, temp);
  return out;
}
