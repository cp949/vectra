import { polylineVertexTangentInto } from '../internal/polyline';
import type { Polyline, PointWritable } from '../types/flat-shapes.internal';

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
export function tangentsInto(outPoints: PointWritable[], polyline: Polyline): PointWritable[] {
  const pts = polyline;
  const n = pts.length;
  const snapshot: PointWritable[] = new Array(n);
  for (let i = 0; i < n; i++) {
    snapshot[i] = { x: pts[i].x, y: pts[i].y };
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
