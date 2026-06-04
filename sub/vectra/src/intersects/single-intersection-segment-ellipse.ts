import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { lineFamilyEllipseIntersectionPoint } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, SegmentLike, XYObjectWritable } from '../types';

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
  line: SegmentLike,
  ellipse: EllipseLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable | undefined {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const center = readEllipseCenter(ellipse);
  const out: XYObjectWritable = { x: 0, y: 0 };
  return lineFamilyEllipseIntersectionPoint(
    out,
    readX(a),
    readY(a),
    readX(b) - readX(a),
    readY(b) - readY(a),
    'finite',
    readX(center),
    readY(center),
    readEllipseRadiusX(ellipse),
    readEllipseRadiusY(ellipse),
    epsilon
  )
    ? out
    : undefined;
}
