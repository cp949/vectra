import { lineFamilyEllipseIntersectionPoint } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Ellipse, Segment, PointWritable } from '../types/flat-shapes.internal';

/**
 * segment와 ellipse의 단일 교점을 새 object로 반환한다.
 *
 * tangent이면 접점 object를 반환한다. 교점이 없거나 2개 이상이면 undefined를 반환한다.
 * contained (segment 전체가 ellipse 내부) 또는 zero-length segment이면 undefined.
 * empty ellipse (radiusX ≤ 0 또는 radiusY ≤ 0)이면 undefined.
 * allocating companion — internal helper를 직접 호출한다.
 *
 * @param line 교점을 구할 segment
 * @param ellipse 교점을 구할 ellipse
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionSegmentEllipse(
  line: Segment,
  ellipse: Ellipse,
  epsilon = DEFAULT_EPSILON
): PointWritable | undefined {
  const out: PointWritable = { x: 0, y: 0 };
  return lineFamilyEllipseIntersectionPoint(
    out,
    line.x1,
    line.y1,
    line.x2 - line.x1,
    line.y2 - line.y1,
    'finite',
    ellipse.cx,
    ellipse.cy,
    ellipse.rx,
    ellipse.ry,
    epsilon
  )
    ? out
    : undefined;
}
