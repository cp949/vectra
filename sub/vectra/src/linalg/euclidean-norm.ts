import type { VecLike } from './types';
import { assertFiniteVector } from './validate.internal';

/**
 * vector의 ℓ2 norm `sqrt(Σ x_i²)`을 안정화된 scaling loop로 반환한다.
 *
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 빈 vector는 `0`을 반환한다.
 * 단순 `sum(x*x)` 대신 max scaling 방식(`max * sqrt(Σ (x_i/max)²)`)을 사용해 overflow/underflow에 강건하다.
 *
 * @param vector ℓ2 norm을 계산할 vector
 */
export function euclideanNorm(vector: VecLike): number {
  assertFiniteVector(vector, 'vector');
  let max = 0;
  for (let i = 0; i < vector.length; i++) {
    const a = Math.abs(vector[i]);
    if (a > max) {
      max = a;
    }
  }
  if (max === 0) {
    return 0;
  }
  let sum = 0;
  for (let i = 0; i < vector.length; i++) {
    const s = vector[i] / max;
    sum += s * s;
  }
  return max * Math.sqrt(sum);
}
