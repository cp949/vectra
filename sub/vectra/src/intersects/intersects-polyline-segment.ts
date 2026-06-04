import { segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { lineFamilyPolylineIntersects } from '../internal/polyline-relation';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { PolylineLike, SegmentLike } from '../types';

/**
 * segment과 polyline이 교차하면 true를 반환한다.
 *
 * polyline은 open path로 마지막 point에서 첫 point로 닫지 않는다.
 * segment가 없는 polyline(points.length < 2)은 false를 반환한다.
 *
 * @param line     교차를 검사할 segment
 * @param polyline 교차를 검사할 polyline
 * @param epsilon  교차 판정 허용 오차
 */
export function intersectsPolylineSegment(
  polyline: PolylineLike,
  line: SegmentLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  return lineFamilyPolylineIntersects(lineParam, polyline, epsilon);
}
