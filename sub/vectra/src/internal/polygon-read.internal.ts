import type { PolygonLike, XYInput } from '../types';

function isPolygonPointArray(polygon: PolygonLike): polygon is readonly XYInput[] {
  return Array.isArray(polygon);
}

/**
 * PolygonLike에서 single outer ring point array를 읽는다.
 *
 * array 자체를 넘긴 input은 그대로 사용하고, canonical object shape는 points field를 사용한다.
 *
 * @param polygon point array로 해석할 polygon input
 */
export function readPolygonPoints(polygon: PolygonLike): readonly XYInput[] {
  if (isPolygonPointArray(polygon)) return polygon;
  return polygon.points;
}
