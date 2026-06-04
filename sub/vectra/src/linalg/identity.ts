import { identityInto } from './identity-into';
import { assertNonNegativeSafeInteger } from './validate.internal';

/**
 * `size x size` identity matrix를 새 `number[][]`로 반환한다.
 *
 * `size`는 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * `size === 0`은 `[]`를 반환한다.
 *
 * @param size identity matrix의 한 변 길이. 비음의 safe integer.
 */
export function identity(size: number): number[][] {
  assertNonNegativeSafeInteger(size, 'size');
  const out: number[][] = new Array(size);
  for (let r = 0; r < size; r++) {
    out[r] = new Array(size);
  }
  return identityInto(out, size);
}
