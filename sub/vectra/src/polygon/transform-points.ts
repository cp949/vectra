import type { Polygon, PolygonWritable, Matrix } from '../types/flat-shapes.internal';
import { transformPointsInto } from './transform-points-into';

/**
 * polygon의 모든 point에 affine matrix를 적용한 새 polygon 좌표 배열을 반환한다.
 *
 * 대응 `transformPointsInto`는 입력 좌표 배열과 outPoints가 같은 배열이어도 안전하다.
 *
 * @param polygon point를 읽을 polygon
 * @param matrix 각 point에 적용할 2D affine transform matrix
 */
export function transformPoints(polygon: Polygon, matrix: Matrix): PolygonWritable {
  return transformPointsInto([], polygon, matrix);
}
