import { lineFamilyEllipseIntersectionPoint } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Ellipse, Segment, PointWritable } from '../types/flat-shapes.internal';

/**
 * segment와 ellipse의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * tangent이면 접점을 기록한다. 2-point crossing이면 false (out 미수정).
 * contained (segment 전체가 ellipse 내부) 또는 zero-length segment이면 false.
 * empty ellipse (radiusX ≤ 0 또는 radiusY ≤ 0)이면 false.
 *
 * @param out 교점 좌표를 기록할 { x, y } 객체. 실패 시 수정하지 않는다.
 * @param line 교점을 구할 segment
 * @param ellipse 교점을 구할 ellipse
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionSegmentEllipseInto(
  out: PointWritable,
  line: Segment,
  ellipse: Ellipse,
  epsilon = DEFAULT_EPSILON
): boolean {
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
  );
}
