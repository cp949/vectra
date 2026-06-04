import { polylineVertexTangentInto, readPolylinePoints } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import type { PolylineLike, XYObjectWritable } from '../types';

/**
 * polyline의 모든 vertex tangent를 계산해 outPoints에 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push되며, 같은 outPoints를 반환한다.
 * polyline point array와 outPoints가 같은 배열이어도 안전하다.
 * 입력 vertex 수만큼 결과를 push한다. tangent를 계산할 수 없는 vertex는
 * `{ x: 0, y: 0 }`을 push해 index alignment을 유지한다.
 *
 * @param outPoints tangent object를 기록할 writable output array
 * @param polyline tangent를 계산할 polyline
 */
export function tangentsInto(outPoints: XYObjectWritable[], polyline: PolylineLike): XYObjectWritable[] {
  const pts = readPolylinePoints(polyline);
  const n = pts.length;
  const snapshot: XYObjectWritable[] = new Array(n);
  for (let i = 0; i < n; i++) {
    snapshot[i] = { x: readX(pts[i]), y: readY(pts[i]) };
  }

  outPoints.length = 0;

  const tmp = { x: 0, y: 0 };
  for (let i = 0; i < n; i++) {
    tmp.x = 0;
    tmp.y = 0;
    polylineVertexTangentInto(tmp, snapshot, i);
    outPoints.push({ x: tmp.x, y: tmp.y });
  }

  return outPoints;
}
