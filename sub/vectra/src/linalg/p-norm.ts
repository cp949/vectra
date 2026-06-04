import type { VecLike } from './types';
import { assertFiniteVector, assertValidPNorm } from './validate.internal';

/**
 * vector의 generalized p-norm `(Σ |x_i|^p)^(1/p)`을 안정화된 scaling loop로 반환한다.
 *
 * `p`는 finite number이며 `p >= 1`이어야 한다. 위반 시 `RangeError`(`NaN`, `±Infinity`, `p < 1` 포함).
 * 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * 빈 vector는 `0`을 반환한다.
 * 단순 `(Σ |x_i|^p)^(1/p)` 대신 max scaling 방식(`max * (Σ (|x_i|/max)^p)^(1/p)`)을 사용해 overflow에 강건하다.
 *
 * @param vector p-norm을 계산할 vector
 * @param p p-norm 차수. finite `>= 1`만 허용.
 */
export function pNorm(vector: VecLike, p: number): number {
  assertValidPNorm(p);
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
    sum += (Math.abs(vector[i]) / max) ** p;
  }
  return max * sum ** (1 / p);
}
