import { scaleVectorInto } from './scale-vector-into';
import type { VecLike } from './types';

/**
 * vector를 scalar로 곱한 결과를 새 `number[]`로 반환한다.
 *
 * finite/non-finite 입력과 결과 처리 정책은 `scaleVectorInto`와 동일하다.
 */
export function scaleVector(vector: VecLike, scalar: number): number[] {
  return scaleVectorInto(new Array<number>(vector.length), vector, scalar);
}
