import type { RectLike, RectWritable } from '../types';
import { createRect } from './create-rect';
import { intersectionInto } from './intersection-into';

/**
 * 두 rect의 양수-area 교집합을 새 plain rect로 반환한다.
 *
 * 둘 중 하나라도 empty이거나 edge touch/corner-only 접촉처럼 교집합 area가 0이면 undefined를
 * 반환한다.
 *
 * @param a 교집합을 계산할 첫 번째 rect
 * @param b 교집합을 계산할 두 번째 rect
 */
export function intersection(a: RectLike, b: RectLike): RectWritable | undefined {
  const out = createRect();
  return intersectionInto(out, a, b) ? out : undefined;
}
