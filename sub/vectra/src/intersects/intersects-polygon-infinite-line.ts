import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { infiniteLineToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { lineFamilyPolygonIntersects } from '../internal/polygon-relation';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, PolygonLike } from '../types';

/**
 * infinite-line과 polygon이 교차하면 true를 반환한다.
 *
 * - infinite-line은 양방향으로 무한히 뻗는다.
 * - polygon edge와 infinite-line의 교차 여부로 판정한다.
 * - collinear 꼭짓점, self-intersecting polygon도 동일한 규칙으로 판정한다.
 * - empty polygon (points.length < 3): false.
 *
 * @param polygon      교차를 검사할 polygon
 * @param infiniteLine 교차를 검사할 infinite-line
 * @param epsilon      교차 판정 허용 오차
 */
export function intersectsPolygonInfiniteLine(
  polygon: PolygonLike,
  infiniteLine: InfiniteLineLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const o = readInfiniteLineOrigin(infiniteLine);
  const d = readInfiniteLineDirection(infiniteLine);
  const lineParam = infiniteLineToLineFamilyParam(readX(o), readY(o), readX(d), readY(d));
  return lineFamilyPolygonIntersects(lineParam, polygon, epsilon);
}
