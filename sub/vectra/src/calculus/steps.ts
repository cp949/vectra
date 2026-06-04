import { stepsInto } from './steps-into';

/**
 * `start`부터 `step`을 더해 `count`개의 sample을 새 `number[]`로 반환한다.
 *
 * `start`/`step`은 finite number, `count`는 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * `step === 0`은 허용한다(모든 entry가 `start`).
 * `count === 0`은 `[]`. `count >= 1`이면 index `0`은 `start`, 이후 entry는 `start + step * index`다.
 * 산식 결과가 non-finite가 되면 `RangeError`. 결과의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param start 첫 entry로 사용할 시작값. finite number.
 * @param step 각 entry에 누적할 step. finite number. `0` 허용.
 * @param count 생성할 sample 개수. 비음의 safe integer.
 */
export function steps(start: number, step: number, count: number): number[] {
  return stepsInto([], start, step, count);
}
