import type { PointWritable } from '../types/flat-shapes.internal';
import { lineFamilyIntersectionPoint } from './line-family-core.internal';
import type { LineFamilyParam } from './line-family-param.internal';
import { DEFAULT_EPSILON } from './numeric';

/**
 * side 목록에서 line-family와 단일 distinct 교점만 있으면 out에 기록하고 true를 반환한다.
 *
 * distinct 교점이 2개 이상이거나 교점이 없으면 false를 반환하고 out을 수정하지 않는다.
 * corner 공유로 인한 중복 점은 거리 ≤ epsilon으로 제거한다.
 */
export function findSingleLineFamilySideIntersectionPoint(
  out: PointWritable,
  line: LineFamilyParam,
  sides: readonly LineFamilyParam[],
  epsilon: number | undefined
): boolean {
  const point = findSingleLineFamilySidePoint(line, sides, epsilon);
  if (point === undefined) return false;
  out.x = point.x;
  out.y = point.y;
  return true;
}

/** side 목록에서 중복을 제거한 교점이 하나뿐이면 그 점을 반환한다. */
export function findSingleLineFamilySidePoint(
  line: LineFamilyParam,
  sides: readonly LineFamilyParam[],
  epsilon: number | undefined
): PointWritable | undefined {
  const eps = epsilon ?? DEFAULT_EPSILON;
  const tmp: PointWritable = { x: 0, y: 0 };
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
    if (dx * dx + dy * dy > eps * eps) return undefined;
  }

  if (count === 0) return undefined;
  tmp.x = px0;
  tmp.y = py0;
  return tmp;
}
