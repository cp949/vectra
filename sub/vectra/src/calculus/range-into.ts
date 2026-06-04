import { commitSequenceInto } from './sequence-commit.internal';
import { assertFiniteNumber, assertNonNegativeSafeInteger } from './validate.internal';

/**
 * `start..stop`을 `step` 간격으로 나눈 half-open sequence를 `out`에 기록한다.
 *
 * `start`/`stop`/`step`은 finite number여야 한다. 위반 시 `RangeError`. `step` 기본값은 `1`.
 * `step === 0`은 `RangeError`. `stop`은 결과에 포함하지 않는다.
 * `step > 0`이면 `value < stop`인 entry만, `step < 0`이면 `value > stop`인 entry만 포함한다.
 * direction이 start/stop과 맞지 않으면(`step > 0 && start >= stop` 또는 `step < 0 && start <= stop`)
 * 결과는 `[]`.
 * non-representable step에서 `Math.ceil(span / step)` 결과가 실제 stop을 초과하는 entry를 포함할 수 있으므로
 * 각 entry를 commit 직전에 stop-exclusive로 한 번 더 검증해 overshoot을 잘라낸다.
 * 결과 길이를 division 기반으로 산출하고 safe integer 범위를 넘으면 `RangeError`. 반복 중 `start + step * i`가
 * non-finite가 되면 `RangeError`.
 * validation 또는 계산이 실패하면 `out`은 호출 전 상태 그대로 남는다(모든 산술이 끝난 뒤 commit).
 * 성공 시 결과의 `-0`은 `0`으로 canonicalize한다. 반환값은 `out`.
 *
 * @param out sequence를 기록할 writable storage. 호출 전 length는 무시되고 commit 후 정확한 length를 갖는다.
 * @param start 첫 entry로 사용할 시작값. finite number.
 * @param stop 도달 시 멈추는 (exclusive) 끝값. finite number.
 * @param step 각 entry 사이 step. finite non-zero number. 기본 `1`.
 */
export function rangeInto(out: number[], start: number, stop: number, step: number = 1): number[] {
  assertFiniteNumber(start, 'start');
  assertFiniteNumber(stop, 'stop');
  assertFiniteNumber(step, 'step');
  if (step === 0) {
    throw new RangeError('range step must not be 0, got 0');
  }

  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
    out.length = 0;
    return out;
  }

  const span = stop - start;
  if (!Number.isFinite(span)) {
    throw new RangeError(`range span (stop - start) must be finite, got ${String(span)}`);
  }
  const rawCount = Math.ceil(span / step);
  assertNonNegativeSafeInteger(rawCount, 'range count');

  const temp = new Array<number>(rawCount);
  let actualCount = 0;
  for (let i = 0; i < rawCount; i++) {
    const value = start + step * i;
    if (!Number.isFinite(value)) {
      throw new RangeError(`range entry at index ${i} must be finite, got ${String(value)}`);
    }
    // fp drift로 마지막 entry가 stop에 도달하거나 초과할 수 있다. stop-exclusive 정책을 강제한다.
    if (step > 0 ? value >= stop : value <= stop) {
      break;
    }
    temp[actualCount] = value;
    actualCount++;
  }
  temp.length = actualCount;

  commitSequenceInto(out, temp);
  return out;
}
