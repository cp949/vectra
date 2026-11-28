import {
  infiniteLineToLineFamilyParam,
  lineFamilyIntersectionPoint,
  segmentToLineFamilyParam,
} from '../internal/line-family';
import type { InfiniteLine, Segment, PointWritable } from '../types/flat-shapes.internal';

/**
 * segment와 infinite-line의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 있으면 `{ x, y }` object를 반환하고, 없으면 undefined를 반환한다.
 * collinear/parallel 또는 zero-length segment이면 undefined를 반환한다.
 * allocating companion — Into leaf를 거치지 않고 internal helper를 직접 호출한다.
 *
 * @param line 교점을 구할 segment
 * @param infLine 교점을 구할 infinite-line
 * @param epsilon cross product 절대값 및 거리 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function singleIntersectionSegmentInfiniteLine(
  line: Segment,
  infLine: InfiniteLine,
  epsilon?: number
): PointWritable | undefined {
  const lineParam = segmentToLineFamilyParam(line.x1, line.y1, line.x2, line.y2);
  const infParam = infiniteLineToLineFamilyParam(infLine.ox, infLine.oy, infLine.dx, infLine.dy);

  const out: PointWritable = { x: 0, y: 0 };
  return lineFamilyIntersectionPoint(out, lineParam, infParam, epsilon) ? out : undefined;
}
