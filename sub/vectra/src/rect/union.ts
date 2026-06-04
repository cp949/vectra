import type { RectLike, RectWritable } from '../types';
import { createRect } from './create-rect';
import { unionInto } from './union-into';

/**
 * 두 rect의 union rect를 새 plain rect로 반환한다.
 *
 * 한쪽이 empty이면 다른 쪽을 복사하고, 둘 다 empty이면 a를 그대로 복사한다.
 *
 * @param a union을 계산할 첫 번째 rect
 * @param b union을 계산할 두 번째 rect
 */
export function union(a: RectLike, b: RectLike): RectWritable {
  return unionInto(createRect(), a, b);
}
