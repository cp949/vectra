import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { lineFamilyEllipseIntersectionPoint } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, InfiniteLineLike, XYWritable } from '../types';

/**
 * infinite-line과 ellipse의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * tangent이면 접점을 기록한다. 2-point crossing이면 false (out 미수정).
 * empty ellipse (radiusX ≤ 0 또는 radiusY ≤ 0): false.
 */
export function singleIntersectionInfiniteLineEllipseInto(
  out: XYWritable,
  line: InfiniteLineLike,
  ellipse: EllipseLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const origin = readInfiniteLineOrigin(line);
  const direction = readInfiniteLineDirection(line);
  const center = readEllipseCenter(ellipse);
  return lineFamilyEllipseIntersectionPoint(
    out,
    readX(origin),
    readY(origin),
    readX(direction),
    readY(direction),
    'inf',
    readX(center),
    readY(center),
    readEllipseRadiusX(ellipse),
    readEllipseRadiusY(ellipse),
    epsilon
  );
}
