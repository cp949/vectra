import type { VecLike } from './types';
import { assertFiniteVector, assertSameVectorLength } from './validate.internal';

/**
 * 두 vector의 dot product `Σ a[i] * b[i]`를 반환한다.
 *
 * 두 vector는 같은 길이여야 하며 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 빈 vector 쌍은 `0`을 반환한다.
 *
 * @param a dot product의 첫 번째 vector
 * @param b dot product의 두 번째 vector
 */
export function dotProduct(a: VecLike, b: VecLike): number {
  assertSameVectorLength(a, b, 'a', 'b');
  assertFiniteVector(a, 'a');
  assertFiniteVector(b, 'b');
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}
