import { lineFamilyCircleIntersectionPoint, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Circle, Segment, PointWritable } from '../types/flat-shapes.internal';

/**
 * segment와 circle의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * tangent이면 접점을 기록한다. 2-point crossing이면 false (out 미수정).
 * empty circle (r ≤ 0) 또는 zero-length segment이면 false.
 *
 * @param out 교점 좌표를 기록할 { x, y } 객체. 실패 시 수정하지 않는다.
 * @param line 교점을 구할 segment
 * @param circle 교점을 구할 circle
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionSegmentCircleInto(
  out: PointWritable,
  line: Segment,
  circle: Circle,
  epsilon = DEFAULT_EPSILON
): boolean {
  const lineParam = segmentToLineFamilyParam(line.x1, line.y1, line.x2, line.y2);
  return lineFamilyCircleIntersectionPoint(out, lineParam, circle.cx, circle.cy, circle.r, epsilon);
}
