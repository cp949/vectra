import type { Polygon, Point, PolygonWritable } from '../types/flat-shapes.internal';

/**
 * polygon의 모든 point에 offset을 더해 outPoints에 좌표 쌍으로 기록한다.
 *
 * outPoints에 좌표를 덮어쓰고 길이를 입력과 맞춘다. 같은 outPoints를 반환한다.
 * 입력 좌표 배열과 outPoints가 같은 배열이어도 안전하다.
 *
 * @param outPoints 좌표를 기록할 writable 배열 (`[x0, y0, …]`)
 * @param polygon point를 읽을 polygon
 * @param offset 각 point에 더할 offset
 */
export function translatePointsInto(outPoints: PolygonWritable, polygon: Polygon, offset: Point): PolygonWritable {
  const { x: dx, y: dy } = offset;
  for (let i = 0; i < polygon.length; i += 2) {
    const x = polygon[i];
    const y = polygon[i + 1];
    outPoints[i] = x + dx;
    outPoints[i + 1] = y + dy;
  }
  outPoints.length = polygon.length;
  return outPoints;
}
