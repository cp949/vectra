import { lineFamilyEllipseIntersectionPoint } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Ellipse, InfiniteLine, PointWritable } from '../types/flat-shapes.internal';

/**
 * infinite-line과 ellipse의 단일 교점을 새 object로 반환한다.
 *
 * tangent이면 접점 object를 반환한다. 교점이 없거나 2개 이상이면 undefined를 반환한다.
 * allocating companion — internal helper를 직접 호출한다.
 *
 * degenerate/empty 입력 처리 정책은 `singleIntersectionInfiniteLineEllipseInto`와 동일하다.
 */
export function singleIntersectionInfiniteLineEllipse(
  line: InfiniteLine,
  ellipse: Ellipse,
  epsilon = DEFAULT_EPSILON
): PointWritable | undefined {
  const out: PointWritable = { x: 0, y: 0 };
  return lineFamilyEllipseIntersectionPoint(
    out,
    line.ox,
    line.oy,
    line.dx,
    line.dy,
    'inf',
    ellipse.cx,
    ellipse.cy,
    ellipse.rx,
    ellipse.ry,
    epsilon
  )
    ? out
    : undefined;
}
