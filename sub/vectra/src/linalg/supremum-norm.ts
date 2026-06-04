import type { VecLike } from './types';
import { assertFiniteVector } from './validate.internal';

/**
 * vector의 ℓ∞ norm `max |x_i|`을 반환한다.
 *
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 빈 vector는 `0`을 반환한다(공집합의 max convention).
 *
 * @param vector ℓ∞ norm을 계산할 vector
 */
export function supremumNorm(vector: VecLike): number {
  assertFiniteVector(vector, 'vector');
  let max = 0;
  for (let i = 0; i < vector.length; i++) {
    const a = Math.abs(vector[i]);
    if (a > max) {
      max = a;
    }
  }
  return max;
}
