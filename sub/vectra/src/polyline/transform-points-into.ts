import type { Matrix, Polyline, PointWritable } from '../types/flat-shapes.internal';

/**
 * polyline의 모든 point에 affine matrix를 적용해 outPoints에 새 point object로 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push되며, 같은 outPoints를 반환한다.
 * matrix translation을 포함해 point로 transform한다.
 * polyline point array와 outPoints가 같은 배열이어도 안전하다.
 *
 * @param outPoints 변환된 point object를 기록할 writable output array
 * @param polyline point를 읽을 polyline
 * @param matrix 각 point에 적용할 affine matrix
 */
export function transformPointsInto(outPoints: PointWritable[], polyline: Polyline, matrix: Matrix): PointWritable[] {
  const pts = polyline;
  const n = pts.length;
  const a = matrix.a;
  const b = matrix.b;
  const c = matrix.c;
  const d = matrix.d;
  const tx = matrix.tx;
  const ty = matrix.ty;
  // input/output array aliasing에 대비해 clear 전에 좌표를 snapshot한다.
  const xs: number[] = new Array(n);
  const ys: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    xs[i] = pts[i].x;
    ys[i] = pts[i].y;
  }
  outPoints.length = 0;
  for (let i = 0; i < n; i++) {
    outPoints.push({ x: a * xs[i] + c * ys[i] + tx, y: b * xs[i] + d * ys[i] + ty });
  }
  return outPoints;
}
