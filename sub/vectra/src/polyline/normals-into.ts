import { polylineVertexTangentInto } from '../internal/polyline';
import type { Polyline, PointWritable } from '../types/flat-shapes.internal';

/**
 * polyline의 모든 vertex left normal을 계산해 outPoints에 기록한다.
 *
 * normal은 vertex tangent `(tx, ty)`의 left normal `(-ty, tx)`다. vertex tangent 정책은
 * `tangentsInto`와 같다. outPoints는 먼저 clear된 뒤 결과 point가 push되며, 같은 outPoints를
 * 반환한다. 입력 vertex 수만큼 결과를 push한다. tangent를 계산할 수 없는 vertex는 index alignment를
 * 유지하기 위해 `{ x: 0, y: 0 }`을 push한다. empty polyline은 outPoints를 clear하고 빈 배열을
 * 반환한다.
 *
 * 부호 반전 산술 `-ty`는 `ty`가 `0`일 때 JS signed-zero 규칙에 따라 `-0`을 그대로 기록한다.
 * polyline point array와 outPoints가 같은 배열이어도 안전하도록 source 좌표 snapshot을 먼저 만든다.
 * 기존 polyline domain과 맞춰 non-finite 좌표 validation은 수행하지 않는다.
 *
 * @param outPoints normal object를 기록할 writable output array
 * @param polyline normal을 계산할 polyline
 */
export function normalsInto(outPoints: PointWritable[], polyline: Polyline): PointWritable[] {
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
    if (polylineVertexTangentInto(tmp, snapshot, i)) {
      outPoints.push({ x: -tmp.y, y: tmp.x });
    } else {
      outPoints.push({ x: 0, y: 0 });
    }
  }

  return outPoints;
}
