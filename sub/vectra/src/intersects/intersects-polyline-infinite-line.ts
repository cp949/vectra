import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { infiniteLineToLineFamilyParam } from '../internal/line-family';
import { lineFamilyPolylineIntersects } from '../internal/polyline-relation';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, PolylineLike } from '../types';

/**
 * infinite-line과 polyline이 교차하면 true를 반환한다.
 *
 * polyline은 open path로 마지막 point에서 첫 point로 닫지 않는다.
 * segment가 없는 polyline(points.length < 2)은 false를 반환한다.
 *
 * @param infiniteLine 교차를 검사할 infinite-line
 * @param polyline     교차를 검사할 polyline
 * @param epsilon      교차 판정 허용 오차
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function intersectsPolylineInfiniteLine(
  polyline: PolylineLike,
  infiniteLine: InfiniteLineLike,
  epsilon?: number
): boolean {
  const o = readInfiniteLineOrigin(infiniteLine);
  const d = readInfiniteLineDirection(infiniteLine);
  const lineParam = infiniteLineToLineFamilyParam(readX(o), readY(o), readX(d), readY(d));
  return lineFamilyPolylineIntersects(lineParam, polyline, epsilon);
}
