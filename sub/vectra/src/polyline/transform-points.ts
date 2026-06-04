import type { MatrixLike, PolylineLike, XYObjectWritable } from '../types';
import { transformPointsInto } from './transform-points-into';

/**
 * polyline의 모든 point에 affine matrix를 적용한 새 point 배열을 반환한다.
 *
 * 대응 `transformPointsInto`는 input point array와 outPoints가 같은 배열이어도 안전하다.
 *
 * @param polyline point를 읽을 polyline
 * @param matrix 각 point에 적용할 affine matrix
 */
export function transformPoints(polyline: PolylineLike, matrix: MatrixLike): XYObjectWritable[] {
  return transformPointsInto([], polyline, matrix);
}
