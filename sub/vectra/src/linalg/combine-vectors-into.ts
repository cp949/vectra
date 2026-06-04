import { commitVectorInto } from './commit-vector.internal';
import type { VecLike, VecWritable } from './types';
import { assertFiniteVector, assertSameVectorLength } from './validate.internal';

/**
 * 두 vector를 callback으로 합성한 결과 `out[i] = fn(a[i], b[i], i)`를 `out`에 기록하고 `out`을 반환한다.
 *
 * 두 vector는 같은 길이여야 하며 모든 entry와 callback result는 finite number여야 한다.
 * `fn`이 던진 예외는 그대로 전파하고 `out`은 수정하지 않는다.
 * `out === a` 또는 `out === b` aliasing을 허용한다.
 */
export function combineVectorsInto<Out extends VecWritable>(
  out: Out,
  a: VecLike,
  b: VecLike,
  fn: (a: number, b: number, index: number) => number
): Out {
  assertSameVectorLength(a, b, 'a', 'b');
  assertFiniteVector(a, 'a');
  assertFiniteVector(b, 'b');
  const temp = new Array<number>(a.length);
  for (let i = 0; i < a.length; i++) {
    const value = fn(a[i], b[i], i);
    if (!Number.isFinite(value)) {
      throw new RangeError(`fn(a[${i}], b[${i}], ${i}) must return a finite number, got ${String(value)}`);
    }
    temp[i] = Object.is(value, -0) ? 0 : value;
  }
  commitVectorInto(out, temp, a.length, 'out');
  return out;
}
