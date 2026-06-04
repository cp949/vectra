import { commitVectorInto } from './commit-vector.internal';
import type { VecLike, VecWritable } from './types';
import { assertFiniteVector, assertSameVectorLength } from './validate.internal';

/**
 * 두 vector의 element-wise sum `out[i] = a[i] + b[i]`를 `out`에 기록하고 `out`을 반환한다.
 *
 * 두 vector는 같은 길이여야 하며 모든 entry와 결과 entry는 finite number여야 한다.
 * `out`은 target length 이상의 capacity를 가져야 한다. 실패하면 `out`은 수정하지 않는다.
 * `out === a` 또는 `out === b` aliasing을 허용한다.
 */
export function addVectorsInto<Out extends VecWritable>(out: Out, a: VecLike, b: VecLike): Out {
  assertSameVectorLength(a, b, 'a', 'b');
  assertFiniteVector(a, 'a');
  assertFiniteVector(b, 'b');
  const temp = new Array<number>(a.length);
  for (let i = 0; i < a.length; i++) {
    const value = a[i] + b[i];
    if (!Number.isFinite(value)) {
      throw new RangeError(`a[${i}] + b[${i}] must be a finite number, got ${String(value)}`);
    }
    temp[i] = Object.is(value, -0) ? 0 : value;
  }
  commitVectorInto(out, temp, a.length, 'out');
  return out;
}
