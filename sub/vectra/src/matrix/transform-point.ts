import type { Matrix, Point, PointWritable } from '../types/flat-shapes.internal';
import { transformPointInto } from './transform-point-into';

/**
 * point에 matrix를 적용한 결과를 새 plain point로 반환한다.
 *
 * translation component tx/ty를 포함한다.
 *
 * @param matrix point에 적용할 matrix
 * @param point 변환할 point
 */
export function transformPoint(matrix: Matrix, point: Point): PointWritable {
  return transformPointInto({ x: 0, y: 0 }, matrix, point);
}
