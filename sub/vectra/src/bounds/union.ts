import type { BoundsLike, BoundsWritable } from '../types';
import { createBounds } from './create-bounds';
import { unionInto } from './union-into';

/**
 * a와 b의 union bounds를 새 plain bounds로 반환한다.
 *
 * 한쪽이 empty이면 다른 쪽을 복사하고, 둘 다 empty이면 a를 복사한다.
 *
 * @param a 합칠 첫 번째 bounds
 * @param b 합칠 두 번째 bounds
 */
export function union(a: BoundsLike, b: BoundsLike): BoundsWritable {
  return unionInto(createBounds(), a, b);
}
