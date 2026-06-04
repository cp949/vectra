import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import { readPolygonPoints } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import type { MatrixLike, PolygonLike, XYObjectWritable } from '../types';

/**
 * polygon의 모든 point에 matrix transform을 적용해 outPoints에 새 point object로 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push되며, 같은 outPoints를 반환한다.
 * 입력 point array와 outPoints가 같은 배열이어도 안전하다.
 * transform formula: x' = a*x + c*y + tx, y' = b*x + d*y + ty
 *
 * @param outPoints 변환된 point object를 기록할 writable output array
 * @param polygon point를 읽을 polygon
 * @param matrix 각 point에 적용할 2D affine transform matrix
 */
export function transformPointsInto(
  outPoints: XYObjectWritable[],
  polygon: PolygonLike,
  matrix: MatrixLike
): XYObjectWritable[] {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;
  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);
  const tx = readMatrixTx(matrix);
  const ty = readMatrixTy(matrix);
  // input/output array aliasing에 대비해 clear 전에 좌표를 snapshot한다.
  const xs: number[] = new Array(n);
  const ys: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    xs[i] = readX(pts[i]);
    ys[i] = readY(pts[i]);
  }
  outPoints.length = 0;
  for (let i = 0; i < n; i++) {
    outPoints.push({ x: a * xs[i] + c * ys[i] + tx, y: b * xs[i] + d * ys[i] + ty });
  }
  return outPoints;
}
