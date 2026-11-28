import { segmentToLineFamilyParam } from '../internal/line-family';
import { lineFamilyPolylineIntersects } from '../internal/polyline-relation';
import type { Polyline, Segment } from '../types/flat-shapes.internal';

/**
 * segment과 polyline이 교차하면 true를 반환한다.
 *
 * polyline은 open path로 마지막 point에서 첫 point로 닫지 않는다.
 * segment가 없는 polyline(polyline.length < 2)은 false를 반환한다.
 *
 * @param line     교차를 검사할 segment
 * @param polyline 교차를 검사할 polyline
 * @param epsilon  교차 판정 허용 오차
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function intersectsPolylineSegment(polyline: Polyline, line: Segment, epsilon?: number): boolean {
  const lineParam = segmentToLineFamilyParam(line.x1, line.y1, line.x2, line.y2);
  return lineFamilyPolylineIntersects(lineParam, polyline, epsilon);
}
