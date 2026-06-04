import type { VecLike } from './types';
import { assertFiniteVector } from './validate.internal';

/**
 * vector의 ℓ1 norm `Σ |x_i|`을 반환한다.
 *
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 누적 합계가 `Infinity`로 overflow되면 `RangeError`를 던진다(개별 entry가 finite여도 합산은 overflow될 수 있다).
 * 빈 vector는 `0`을 반환한다.
 *
 * @param vector ℓ1 norm을 계산할 vector
 */
export function sumNorm(vector: VecLike): number {
  assertFiniteVector(vector, 'vector');
  let total = 0;
  for (let i = 0; i < vector.length; i++) {
    total += Math.abs(vector[i]);
    if (!Number.isFinite(total)) {
      throw new RangeError(`sumNorm overflow at index ${i}`);
    }
  }
  return total;
}
