import { crossProductInto } from './cross-product-into';
import type { VecLike } from './types';

/**
 * 길이 3 vector 두 개의 3D cross product `a × b`를 길이 3 새 `number[]`로 반환한다.
 *
 * 두 vector는 모두 길이 `3`이어야 하며 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 *
 * @param a cross product의 첫 번째 vector (길이 3)
 * @param b cross product의 두 번째 vector (길이 3)
 */
export function crossProduct(a: VecLike, b: VecLike): number[] {
  const out: number[] = new Array(3);
  return crossProductInto(out, a, b);
}
