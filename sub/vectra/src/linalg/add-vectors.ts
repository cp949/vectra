import { addVectorsInto } from './add-vectors-into';
import type { VecLike } from './types';

/**
 * 두 vector의 element-wise sum을 새 `number[]`로 반환한다.
 *
 * finite/non-finite 입력과 결과 처리 정책은 `addVectorsInto`와 동일하다.
 */
export function addVectors(a: VecLike, b: VecLike): number[] {
  return addVectorsInto(new Array<number>(a.length), a, b);
}
