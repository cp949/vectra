import type { PolylineLike, XYInput } from '../types';

function isPolylinePointArray(polyline: PolylineLike): polyline is readonly XYInput[] {
  return Array.isArray(polyline);
}

/**
 * PolylineLike에서 ordered point array를 읽는다.
 *
 * array 자체를 넘긴 input은 그대로 사용하고, canonical object shape는 points field를 사용한다.
 *
 * @param polyline point array로 해석할 polyline input
 */
export function readPolylinePoints(polyline: PolylineLike): readonly XYInput[] {
  if (isPolylinePointArray(polyline)) return polyline;
  return polyline.points;
}
