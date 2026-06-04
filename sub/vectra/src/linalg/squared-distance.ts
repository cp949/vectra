import type { VecLike } from './types';
import { assertFiniteVector, assertSameVectorLength } from './validate.internal';

/**
 * 두 vector 사이의 squared Euclidean distance `Σ(a[i] - b[i])²`를 반환한다.
 */
export function squaredDistance(a: VecLike, b: VecLike): number {
  assertSameVectorLength(a, b, 'a', 'b');
  assertFiniteVector(a, 'a');
  assertFiniteVector(b, 'b');
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    const term = diff * diff;
    sum += term;
    if (!Number.isFinite(diff) || !Number.isFinite(term) || !Number.isFinite(sum)) {
      throw new RangeError(`squared distance accumulation must be finite at index ${i}`);
    }
  }
  return Object.is(sum, -0) ? 0 : sum;
}
