import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { infiniteLineToLineFamilyParam, lineFamilyCircleIntersects } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { CircleLike, InfiniteLineLike } from '../types';

/**
 * circle과 infinite-line이 교차하거나 접하면 true를 반환한다.
 *
 * closed disk 판정. tangent, 2-point crossing 모두 true.
 * radius ≤ 0인 circle: false.
 *
 * @param circle 교차를 판정할 circle
 * @param infiniteLine 교차를 판정할 infinite line
 * @param epsilon 부동소수점 비교에 사용할 tolerance
 */
export function intersectsCircleInfiniteLine(
  circle: CircleLike,
  infiniteLine: InfiniteLineLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const origin = readInfiniteLineOrigin(infiniteLine);
  const dir = readInfiniteLineDirection(infiniteLine);
  const lineParam = infiniteLineToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const center = readCircleCenter(circle);
  return lineFamilyCircleIntersects(lineParam, readX(center), readY(center), readCircleRadius(circle), epsilon);
}
