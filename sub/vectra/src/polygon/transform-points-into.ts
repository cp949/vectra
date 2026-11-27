import type { Polygon, PolygonWritable, Matrix } from '../types/flat-shapes.internal';

/**
 * polygon의 모든 point에 matrix transform을 적용해 outPoints에 좌표 쌍으로 기록한다.
 *
 * outPoints에 좌표를 덮어쓰고 길이를 입력과 맞춘다. 같은 outPoints를 반환한다.
 * 입력 좌표 배열과 outPoints가 같은 배열이어도 안전하다.
 * transform formula: x' = a*x + c*y + tx, y' = b*x + d*y + ty
 *
 * @param outPoints 좌표를 기록할 writable 배열 (`[x0, y0, …]`)
 * @param polygon point를 읽을 polygon
 * @param matrix 각 point에 적용할 2D affine transform matrix
 */
export function transformPointsInto(outPoints: PolygonWritable, polygon: Polygon, matrix: Matrix): PolygonWritable {
  const { a, b, c, d, tx, ty } = matrix;
  for (let i = 0; i < polygon.length; i += 2) {
    const x = polygon[i];
    const y = polygon[i + 1];
    outPoints[i] = a * x + c * y + tx;
    outPoints[i + 1] = b * x + d * y + ty;
  }
  outPoints.length = polygon.length;
  return outPoints;
}
