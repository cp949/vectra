import type { VecLike } from './types';
import { assertFiniteVector, assertVectorLength } from './validate.internal';

/**
 * 길이 3 vector 세 개의 scalar triple product `(a × b) · c`를 반환한다.
 *
 * 세 vector 모두 길이 `3`이어야 하며 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 *
 * @param a triple product의 첫 번째 vector (길이 3)
 * @param b triple product의 두 번째 vector (길이 3)
 * @param c triple product의 세 번째 vector (길이 3)
 */
export function tripleProduct(a: VecLike, b: VecLike, c: VecLike): number {
  assertVectorLength(a, 3, 'a');
  assertVectorLength(b, 3, 'b');
  assertVectorLength(c, 3, 'c');
  assertFiniteVector(a, 'a');
  assertFiniteVector(b, 'b');
  assertFiniteVector(c, 'c');
  return (a[1] * b[2] - a[2] * b[1]) * c[0] + (a[2] * b[0] - a[0] * b[2]) * c[1] + (a[0] * b[1] - a[1] * b[0]) * c[2];
}
