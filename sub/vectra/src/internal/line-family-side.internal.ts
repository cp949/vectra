import type { XYObjectWritable, XYWritable } from '../types';
import { lineFamilyIntersectionPoint } from './line-family-core.internal';
import type { LineFamilyParam } from './line-family-param.internal';
import { writeXY } from './xy';

/**
 * side 목록에서 line-family와 단일 distinct 교점만 있으면 out에 기록하고 true를 반환한다.
 *
 * distinct 교점이 2개 이상이거나 교점이 없으면 false를 반환하고 out을 수정하지 않는다.
 * corner 공유로 인한 중복 점은 거리 ≤ epsilon으로 제거한다.
 */
export function findSingleLineFamilySideIntersectionPoint(
  out: XYWritable,
  line: LineFamilyParam,
  sides: readonly LineFamilyParam[],
  epsilon: number
): boolean {
  const tmp: XYObjectWritable = { x: 0, y: 0 };
  let px0 = 0;
  let py0 = 0;
  let count = 0;

  for (const side of sides) {
    if (!lineFamilyIntersectionPoint(tmp, line, side, epsilon)) continue;
    if (count === 0) {
      px0 = tmp.x;
      py0 = tmp.y;
      count = 1;
      continue;
    }

    const dx = tmp.x - px0;
    const dy = tmp.y - py0;
    if (dx * dx + dy * dy > epsilon * epsilon) return false;
  }

  if (count === 1) {
    writeXY(out, px0, py0);
    return true;
  }
  return false;
}
