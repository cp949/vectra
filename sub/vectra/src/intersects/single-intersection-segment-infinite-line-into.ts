import {
  infiniteLineToLineFamilyParam,
  lineFamilyIntersectionPoint,
  segmentToLineFamilyParam,
} from '../internal/line-family';
import type { InfiniteLine, Segment, PointWritable } from '../types/flat-shapes.internal';

/**
 * segment와 infinite-line의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 없거나 collinear/parallel이면 false를 반환하고 out을 수정하지 않는다.
 * zero-length segment이면 false.
 *
 * @param out 교점 좌표를 기록할 { x, y } 객체. 실패 시 수정하지 않는다.
 * @param line 교점을 구할 segment
 * @param infLine 교점을 구할 infinite-line
 * @param epsilon cross product 절대값 및 거리 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function singleIntersectionSegmentInfiniteLineInto(
  out: PointWritable,
  line: Segment,
  infLine: InfiniteLine,
  epsilon?: number
): boolean {
  const lineParam = segmentToLineFamilyParam(line.x1, line.y1, line.x2, line.y2);
  const infParam = infiniteLineToLineFamilyParam(infLine.ox, infLine.oy, infLine.dx, infLine.dy);

  return lineFamilyIntersectionPoint(out, lineParam, infParam, epsilon);
}
