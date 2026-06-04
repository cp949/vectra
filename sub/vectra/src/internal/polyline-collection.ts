import type { PolylineLike, XYObjectWritable } from '../types';
import { readPolylinePoints } from './polyline';
import { readX, readY } from './xy';

/**
 * polyline point 순서를 뒤집어 outPoints에 새 point object로 기록하고 outPoints를 반환한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다.
 * polyline point array와 outPoints가 같은 배열이어도 안전하도록 clear 전에 좌표를 snapshot한다.
 * public `reversePointsInto`와 `reversedInto`가 같은 writer를 공유한다.
 * finite 검증은 하지 않는다. NaN/Infinity 좌표는 그대로 전파한다.
 *
 * @param outPoints 뒤집힌 point object를 기록할 writable output array
 * @param polyline point를 읽을 polyline
 */
export function writeReversedPolylinePointsInto(
  outPoints: XYObjectWritable[],
  polyline: PolylineLike
): XYObjectWritable[] {
  const pts = readPolylinePoints(polyline);
  const n = pts.length;
  // input/output array aliasing에 대비해 clear 전에 좌표를 snapshot한다.
  const xs: number[] = new Array(n);
  const ys: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    xs[i] = readX(pts[i]);
    ys[i] = readY(pts[i]);
  }
  outPoints.length = 0;
  for (let i = n - 1; i >= 0; i--) {
    outPoints.push({ x: xs[i], y: ys[i] });
  }
  return outPoints;
}
