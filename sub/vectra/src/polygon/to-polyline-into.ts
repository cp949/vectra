import type { Polygon, PointWritable } from '../types/flat-shapes.internal';

/**
 * polygon vertex를 순서대로 복사해 open polyline view로 outPoints에 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 새 `{ x, y }` point가 push되며, 같은 outPoints를 반환한다.
 * point-collection 기준이다. vertex가 0개면 빈 배열을 반환한다.
 * 좌표 finite 여부를 검사하지 않고 그대로 복사한다.
 *
 * `options.close === true`이고 point가 1개 이상이면 첫 vertex 복사본을 끝에 추가해 닫힌 path로 만든다.
 * 이미 닫혀 있는지(마지막 vertex == 첫 vertex)는 검사하지 않는다.
 *
 * @param outPoints 점을 기록할 writable 배열 (`{ x, y }[]`)
 * @param polygon vertex를 읽을 polygon
 * @param options close — true이면 첫 vertex 복사본을 끝에 추가한다. 기본 false(open view)
 */
export function toPolylineInto(
  outPoints: PointWritable[],
  polygon: Polygon,
  options?: { readonly close: boolean }
): PointWritable[] {
  outPoints.length = 0;
  for (let i = 0; i < polygon.length; i += 2) {
    outPoints.push({ x: polygon[i], y: polygon[i + 1] });
  }
  if (options?.close === true && polygon.length !== 0) {
    outPoints.push({ x: polygon[0], y: polygon[1] });
  }
  return outPoints;
}
