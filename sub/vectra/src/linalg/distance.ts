import type { VecLike } from './types';
import { assertFiniteVector, assertSameVectorLength } from './validate.internal';

/**
 * 두 vector 사이의 Euclidean distance를 max-scaling loop로 반환한다.
 */
export function distance(a: VecLike, b: VecLike): number {
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
  if (max === 0) {
    return 0;
  }
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const scaled = (a[i] - b[i]) / max;
    sum += scaled * scaled;
  }
  return max * Math.sqrt(sum);
}
