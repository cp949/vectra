import type { VecLike, VecWritable } from './types';
import { assertFiniteVector, assertSameVectorLength } from './validate.internal';

/**
 * 두 vector의 element-wise product `out[i] = a[i] * b[i]`를 `out`에 기록하고 `out`을 반환한다.
 *
 * 두 vector는 같은 길이여야 하며 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `out.length`가 vector 길이보다 작으면 `RangeError`를 던지고 `out`은 수정하지 않는다.
 * 길이 검증 후 `out.length`는 vector 길이로 truncate된다(자동 확장하지 않는다).
 * `out`은 `a` 또는 `b`와 같은 array여도 안전하다(element-wise라 in-place 쓰기 안전).
 *
 * @param out 결과를 기록할 writable vector
 * @param a Hadamard product의 첫 번째 vector
 * @param b Hadamard product의 두 번째 vector
 */
export function hadamardProductInto<Out extends VecWritable>(out: Out, a: VecLike, b: VecLike): Out {
  assertSameVectorLength(a, b, 'a', 'b');
  assertFiniteVector(a, 'a');
  assertFiniteVector(b, 'b');
  if (out.length < a.length) {
    throw new RangeError(`out capacity (${out.length}) is less than vector length (${a.length})`);
  }
  const n = a.length;
  for (let i = 0; i < n; i++) {
    out[i] = a[i] * b[i];
  }
  out.length = n;
  return out;
}
