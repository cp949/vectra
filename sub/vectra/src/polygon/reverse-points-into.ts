import type { Polygon, PolygonWritable } from '../types/flat-shapes.internal';

/**
 * polygon point 순서를 뒤집어 outPoints에 좌표 쌍으로 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 뒤집은 좌표 쌍을 차례로 기록하며, 같은 outPoints를 반환한다.
 * 입력 좌표 배열과 outPoints가 같은 배열이어도 안전하다.
 *
 * @param outPoints 좌표를 기록할 writable 배열 (`[x0, y0, …]`)
 * @param polygon point를 읽을 polygon
 */
export function reversePointsInto(outPoints: PolygonWritable, polygon: Polygon): PolygonWritable {
  const source = outPoints === polygon ? polygon.slice() : polygon;
  outPoints.length = 0;
  for (let i = source.length - 2; i >= 0; i -= 2) {
    outPoints.push(source[i], source[i + 1]);
  }
  return outPoints;
}
