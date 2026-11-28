import { lineFamilyTriangleIntersectionPoint, segmentToLineFamilyParam } from '../internal/line-family';
import type { Segment, Triangle, PointWritable } from '../types/flat-shapes.internal';

/**
 * segment와 triangle의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 2개 이상이면 false를 반환하고 out을 수정하지 않는다.
 * degenerate triangle (세 꼭짓점이 collinear) 또는 zero-length segment이면 false.
 *
 * @param out 교점 좌표를 기록할 writable output
 * @param line 교점을 구할 segment
 * @param triangle 교점을 구할 triangle
 * @param epsilon 수치 비교 tolerance
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function singleIntersectionSegmentTriangleInto(
  out: PointWritable,
  line: Segment,
  triangle: Triangle,
  epsilon?: number
): boolean {
  const lineParam = segmentToLineFamilyParam(line.x1, line.y1, line.x2, line.y2);
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  return lineFamilyTriangleIntersectionPoint(out, lineParam, ax, ay, bx, by, cx, cy, epsilon);
}
