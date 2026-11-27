import type { Polygon, PolygonWritable } from '../types/flat-shapes.internal';
import { reversePointsInto } from './reverse-points-into';

/**
 * polygon point 순서를 뒤집은 새 polygon 좌표 배열을 반환한다.
 *
 * 대응 `reversePointsInto`는 입력 좌표 배열과 outPoints가 같은 배열이어도 안전하다.
 */
export function reversePoints(polygon: Polygon): PolygonWritable {
  return reversePointsInto([], polygon);
}
