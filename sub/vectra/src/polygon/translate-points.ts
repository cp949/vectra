import type { Polygon, Point, PolygonWritable } from '../types/flat-shapes.internal';
import { translatePointsInto } from './translate-points-into';

/**
 * polygon의 모든 point에 offset을 더한 새 polygon 좌표 배열을 반환한다.
 *
 * 대응 `translatePointsInto`는 입력 좌표 배열과 outPoints가 같은 배열이어도 안전하다.
 *
 * @param polygon point를 읽을 polygon
 * @param offset 각 point에 더할 offset
 */
export function translatePoints(polygon: Polygon, offset: Point): PolygonWritable {
  return translatePointsInto([], polygon, offset);
}
