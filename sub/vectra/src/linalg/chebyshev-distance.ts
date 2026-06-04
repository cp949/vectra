import type { VecLike } from './types';
import { assertFiniteVector, assertSameVectorLength } from './validate.internal';

/**
 * 두 vector 사이의 Chebyshev distance `max |a[i] - b[i]|`를 반환한다.
 */
export function chebyshevDistance(a: VecLike, b: VecLike): number {
  assertSameVectorLength(a, b, 'a', 'b');
  assertFiniteVector(a, 'a');
  assertFiniteVector(b, 'b');
  let max = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    if (!Number.isFinite(diff)) {
      throw new RangeError(`a[${i}] - b[${i}] must be a finite number, got ${String(diff)}`);
    }
    const abs = Math.abs(diff);
    if (abs > max) {
      max = abs;
    }
  }
  return max;
}
