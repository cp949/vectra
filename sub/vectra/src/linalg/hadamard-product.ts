import { hadamardProductInto } from './hadamard-product-into';
import type { VecLike } from './types';

/**
 * 두 vector의 element-wise product `[a[i] * b[i]]`를 새 `number[]`로 반환한다.
 *
 * 두 vector는 같은 길이여야 하며 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 *
 * @param a Hadamard product의 첫 번째 vector
 * @param b Hadamard product의 두 번째 vector
 */
export function hadamardProduct(a: VecLike, b: VecLike): number[] {
  const out: number[] = new Array(a.length);
  return hadamardProductInto(out, a, b);
}
