import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { lineFamilyEllipseIntersectionPoint } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, SegmentLike, XYWritable } from '../types';

/**
 * segment와 ellipse의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * tangent이면 접점을 기록한다. 2-point crossing이면 false (out 미수정).
 * contained (segment 전체가 ellipse 내부) 또는 zero-length segment이면 false.
 * empty ellipse (radiusX ≤ 0 또는 radiusY ≤ 0)이면 false.
 *
 * @param out 교점 좌표를 기록할 writable output
 * @param line 교점을 구할 segment
 * @param ellipse 교점을 구할 ellipse
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionSegmentEllipseInto(
  out: XYWritable,
  line: SegmentLike,
  ellipse: EllipseLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const center = readEllipseCenter(ellipse);
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
  );
}
