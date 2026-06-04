import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { lineFamilyCircleIntersects, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { CircleLike, SegmentLike } from '../types';

/**
 * circle과 segment가 교차하거나 접하면 true를 반환한다.
 *
 * closed disk 판정. tangent, 2-point crossing, segment 끝점이 disk 내부인 경우 모두 true.
 * radius ≤ 0인 circle: false.
 *
 * @param circle 교차를 판정할 circle
 * @param line 교차를 판정할 segment
 * @param epsilon 부동소수점 비교에 사용할 tolerance
 */
export function intersectsCircleSegment(circle: CircleLike, line: SegmentLike, epsilon = DEFAULT_EPSILON): boolean {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const center = readCircleCenter(circle);
  return lineFamilyCircleIntersects(lineParam, readX(center), readY(center), readCircleRadius(circle), epsilon);
}
