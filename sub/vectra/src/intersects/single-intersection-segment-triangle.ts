import { lineFamilyTriangleIntersectionPoint, segmentToLineFamilyParam } from '../internal/line-family';
import type { Segment, Triangle, PointWritable } from '../types/flat-shapes.internal';

/**
 * segment와 triangle의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 없거나 2개 이상이면 undefined를 반환한다.
 * degenerate triangle (세 꼭짓점이 collinear) 또는 zero-length segment이면 undefined.
 * allocating companion — internal helper를 직접 호출한다.
 *
 * @param line 교점을 구할 segment
 * @param triangle 교점을 구할 triangle
 * @param epsilon 수치 비교 tolerance
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function singleIntersectionSegmentTriangle(
  line: Segment,
  triangle: Triangle,
  epsilon?: number
): PointWritable | undefined {
  const lineParam = segmentToLineFamilyParam(line.x1, line.y1, line.x2, line.y2);
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  const out: PointWritable = { x: 0, y: 0 };
  return lineFamilyTriangleIntersectionPoint(out, lineParam, ax, ay, bx, by, cx, cy, epsilon) ? out : undefined;
}
