import { lineFamilyBoxIntersectionPoint, segmentToLineFamilyParam } from '../internal/line-family';
import type { Bounds, Segment, PointWritable } from '../types/flat-shapes.internal';

/**
 * segment와 bounds의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 없거나 2개 이상이면 undefined를 반환한다.
 * inverted bounds (max < min) 또는 zero-length segment이면 undefined.
 * allocating companion — internal helper를 직접 호출한다.
 *
 * @param line 교점을 구할 segment
 * @param bounds 교점을 구할 bounds (axis-aligned)
 * @param epsilon 수치 비교 tolerance
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function singleIntersectionSegmentBounds(
  line: Segment,
  bounds: Bounds,
  epsilon?: number
): PointWritable | undefined {
  const x0 = bounds.minX;
  const y0 = bounds.minY;
  const x1 = bounds.maxX;
  const y1 = bounds.maxY;
  if (x1 < x0 || y1 < y0) return undefined;
  const lineParam = segmentToLineFamilyParam(line.x1, line.y1, line.x2, line.y2);
  const out: PointWritable = { x: 0, y: 0 };
  return lineFamilyBoxIntersectionPoint(out, lineParam, x0, y0, x1, y1, epsilon) ? out : undefined;
}
