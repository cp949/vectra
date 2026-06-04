import { commitVectorInto } from './commit-vector.internal';
import type { VecLike, VecWritable } from './types';
import { assertFiniteNumber, assertFiniteVector } from './validate.internal';

/**
 * vector를 scalar로 곱한 결과 `out[i] = vector[i] * scalar`를 `out`에 기록하고 `out`을 반환한다.
 *
 * vector entry, scalar, 결과 entry는 모두 finite number여야 한다.
 * `out`은 target length 이상의 capacity를 가져야 한다. 실패하면 `out`은 수정하지 않는다.
 * `out === vector` aliasing을 허용한다.
 */
export function scaleVectorInto<Out extends VecWritable>(out: Out, vector: VecLike, scalar: number): Out {
  assertFiniteNumber(scalar, 'scalar');
  assertFiniteVector(vector, 'vector');
  const temp = new Array<number>(vector.length);
  for (let i = 0; i < vector.length; i++) {
    const value = vector[i] * scalar;
    if (!Number.isFinite(value)) {
      throw new RangeError(`vector[${i}] * scalar must be a finite number, got ${String(value)}`);
    }
    temp[i] = Object.is(value, -0) ? 0 : value;
  }
  commitVectorInto(out, temp, vector.length, 'out');
  return out;
}
