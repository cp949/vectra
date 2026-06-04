import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { lineFamilyEllipseIntersects } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, InfiniteLineLike } from '../types';

/**
 * ellipse와 infinite-line이 교차하거나 접하면 true를 반환한다.
 *
 * tangent, 2-point crossing 모두 true.
 * degenerate ellipse (rx ≤ 0 또는 ry ≤ 0): false.
 * degenerate direction (= 0): origin이 ellipse 경계/내부이면 true.
 *
 * @param ellipse 교차를 검사할 ellipse
 * @param line 교차를 검사할 infinite-line
 * @param epsilon 수치 비교 tolerance
 */
export function intersectsEllipseInfiniteLine(
  ellipse: EllipseLike,
  line: InfiniteLineLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const origin = readInfiniteLineOrigin(line);
  const direction = readInfiniteLineDirection(line);
  const center = readEllipseCenter(ellipse);
  return lineFamilyEllipseIntersects(
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
