import type { VecLike, VecWritable } from './types';
import { assertFiniteVector, assertVectorLength } from './validate.internal';

/**
 * 길이 3 vector 두 개의 3D cross product `a × b`를 `out`에 기록하고 `out`을 반환한다.
 *
 * 두 vector는 모두 길이 `3`이어야 하며 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `out.length`가 3보다 작으면 `RangeError`를 던지고 `out`은 수정하지 않는다.
 * `out.length`는 3으로 truncate된다(자동 확장하지 않는다).
 * `out`이 `a` 또는 `b`와 같은 array여도 안전하다. 모든 entry를 local 변수로 먼저 읽은 뒤 기록한다.
 *
 * @param out 결과를 기록할 writable vector
 * @param a cross product의 첫 번째 vector (길이 3)
 * @param b cross product의 두 번째 vector (길이 3)
 */
export function crossProductInto<Out extends VecWritable>(out: Out, a: VecLike, b: VecLike): Out {
  assertVectorLength(a, 3, 'a');
  assertVectorLength(b, 3, 'b');
  assertFiniteVector(a, 'a');
  assertFiniteVector(b, 'b');
  if (out.length < 3) {
    throw new RangeError(`out capacity (${out.length}) is less than 3`);
  }
  const a0 = a[0];
  const a1 = a[1];
  const a2 = a[2];
  const b0 = b[0];
  const b1 = b[1];
  const b2 = b[2];
  out[0] = a1 * b2 - a2 * b1;
  out[1] = a2 * b0 - a0 * b2;
  out[2] = a0 * b1 - a1 * b0;
  out.length = 3;
  return out;
}
