import { readPolygonPoints } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import type { PolygonLike, XYObjectWritable } from '../types';

/**
 * polygon point 순서를 뒤집어 outPoints에 새 point object로 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push되며, 같은 outPoints를 반환한다.
 * 입력 point array와 outPoints가 같은 배열이어도 안전하다.
 *
 * @param outPoints 역순으로 기록할 writable output array
 * @param polygon point를 읽을 polygon
 */
export function reversePointsInto(outPoints: XYObjectWritable[], polygon: PolygonLike): XYObjectWritable[] {
  const pts = readPolygonPoints(polygon);
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
