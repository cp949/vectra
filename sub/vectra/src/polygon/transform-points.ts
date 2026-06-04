import type { MatrixLike, PolygonLike, XYObjectWritable } from '../types';
import { transformPointsInto } from './transform-points-into';

/**
 * polygon의 모든 point에 affine matrix를 적용한 새 point 배열을 반환한다.
 *
 * 대응 `transformPointsInto`는 input point array와 outPoints가 같은 배열이어도 안전하다.
 *
 * @param polygon point를 읽을 polygon
 * @param matrix 각 point에 적용할 2D affine transform matrix
 */
export function transformPoints(polygon: PolygonLike, matrix: MatrixLike): XYObjectWritable[] {
  return transformPointsInto([], polygon, matrix);
}
