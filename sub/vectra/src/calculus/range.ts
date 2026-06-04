import { rangeInto } from './range-into';

/**
 * `start..stop`을 `step` 간격으로 나눈 half-open sequence를 새 `number[]`로 반환한다.
 *
 * `start`/`stop`/`step`은 finite number여야 한다. 위반 시 `RangeError`. `step` 기본값은 `1`.
 * `step === 0`은 `RangeError`. `stop`은 결과에 포함하지 않는다.
 * `step > 0`이면 `value < stop`인 entry만, `step < 0`이면 `value > stop`인 entry만 포함한다.
 * direction이 start/stop과 맞지 않으면 `[]`.
 * `Math.ceil(span/step)`이 stop을 초과하는 entry를 만들 수 있어 fp drift overshoot는 commit 직전에 잘려나간다.
 * 결과 길이가 safe integer 범위를 넘거나 반복 중 entry가 non-finite가 되면 `RangeError`.
 * 결과의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param start 첫 entry로 사용할 시작값. finite number.
 * @param stop 도달 시 멈추는 (exclusive) 끝값. finite number.
 * @param step 각 entry 사이 step. finite non-zero number. 기본 `1`.
 */
export function range(start: number, stop: number, step: number = 1): number[] {
  return rangeInto([], start, stop, step);
}
