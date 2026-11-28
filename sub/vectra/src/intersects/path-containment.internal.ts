import type { PolygonWritable, Polyline } from '../types/flat-shapes.internal';

/** 닫힌 경로의 포함 판정에 쓸 다각형 좌표 배열을 만든다. */
export function pathPolylineToPolygon(polyline: Polyline): PolygonWritable {
  const polygon: PolygonWritable = [];
  for (const point of polyline) {
    polygon.push(point.x, point.y);
  }
  return polygon;
}
