import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { lineFamilyEllipseIntersectionPoint } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, InfiniteLineLike, XYObjectWritable } from '../types';

/**
 * infinite-line과 ellipse의 단일 교점을 새 object로 반환한다.
 *
 * tangent이면 접점 object를 반환한다. 교점이 없거나 2개 이상이면 undefined를 반환한다.
 * allocating companion — internal helper를 직접 호출한다.
 *
 * degenerate/empty 입력 처리 정책은 `singleIntersectionInfiniteLineEllipseInto`와 동일하다.
 */
export function singleIntersectionInfiniteLineEllipse(
  line: InfiniteLineLike,
  ellipse: EllipseLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable | undefined {
  const origin = readInfiniteLineOrigin(line);
  const direction = readInfiniteLineDirection(line);
  const center = readEllipseCenter(ellipse);
  const out: XYObjectWritable = { x: 0, y: 0 };
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
  )
    ? out
    : undefined;
}
