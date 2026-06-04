import type { BoundsLike, BoundsWritable } from '../types';
import { createBounds } from './create-bounds';
import { intersectionInto } from './intersection-into';

/**
 * a와 b의 양수-area intersection bounds를 새 plain bounds로 반환한다.
 *
 * 둘 중 하나라도 empty이거나 겹침 결과의 area가 0이면 undefined를 반환한다.
 *
 * @param a 교차시킬 첫 번째 bounds
 * @param b 교차시킬 두 번째 bounds
 */
export function intersection(a: BoundsLike, b: BoundsLike): BoundsWritable | undefined {
  const out = createBounds();
  return intersectionInto(out, a, b) ? out : undefined;
}
