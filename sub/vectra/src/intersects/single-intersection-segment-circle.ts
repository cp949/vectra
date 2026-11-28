import { lineFamilyCircleIntersectionPoint, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Circle, Segment, PointWritable } from '../types/flat-shapes.internal';

/**
 * segment와 circle의 단일 교점을 새 object로 반환한다.
 *
 * tangent이면 접점 object를 반환한다. 교점이 없거나 2개 이상이면 undefined를 반환한다.
 * empty circle (r ≤ 0) 또는 zero-length segment이면 undefined.
 * allocating companion — internal helper를 직접 호출한다.
 *
 * @param line 교점을 구할 segment
 * @param circle 교점을 구할 circle
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionSegmentCircle(
  line: Segment,
  circle: Circle,
  epsilon = DEFAULT_EPSILON
): PointWritable | undefined {
  const lineParam = segmentToLineFamilyParam(line.x1, line.y1, line.x2, line.y2);
  const out: PointWritable = { x: 0, y: 0 };
  return lineFamilyCircleIntersectionPoint(out, lineParam, circle.cx, circle.cy, circle.r, epsilon) ? out : undefined;
}
