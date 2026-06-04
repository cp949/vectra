import { subtractVectorsInto } from './subtract-vectors-into';
import type { VecLike } from './types';

/**
 * 두 vector의 element-wise difference를 새 `number[]`로 반환한다.
 *
 * finite/non-finite 입력과 결과 처리 정책은 `subtractVectorsInto`와 동일하다.
 */
export function subtractVectors(a: VecLike, b: VecLike): number[] {
  return subtractVectorsInto(new Array<number>(a.length), a, b);
}
