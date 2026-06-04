import { DEFAULT_EPSILON } from '../internal/numeric';
import { polygonPolylineIntersects } from '../internal/polygon-relation';
import { flattenPathInto } from '../path/flatten.internal';
import type { PathCommand, PathMeasurementOptions, PolygonLike } from '../types';

/**
 * polygon과 path가 교차하면 true를 반환한다.
 *
 * - path를 polyline으로 근사한 뒤 polygonPolylineIntersects로 판정한다.
 * - 판정 조건 (OR):
 *   1. flattened polyline의 임의 점이 polygon 내부(경계 포함)에 있다.
 *   2. flattened polyline의 임의 segment와 polygon edge가 교차한다.
 * - path가 polygon 내부에 완전히 포함된 경우: flattened 첫 point가 polygon 내부에 있어 true.
 * - polygon이 closed path 내부에 완전히 포함된 경우: edge 교차 없이 모든 path 점이 polygon 외부이므로 false. 이 경우 별도 containment 판정이 필요하다.
 * - empty polygon(points.length < 3) 또는 empty path(commands.length === 0): false.
 *
 * @param polygon  교차를 검사할 polygon
 * @param commands flatten할 path command sequence
 * @param options  flatten 옵션 (flatness, maxRecursion)
 */
export function intersectsPathPolygon(
  commands: readonly PathCommand[],
  polygon: PolygonLike,
  options?: PathMeasurementOptions
): boolean {
  if (commands.length === 0) return false;
  const tmp: { x: number; y: number }[] = [];
  flattenPathInto(tmp, commands, options);
  if (tmp.length === 0) return false;
  return polygonPolylineIntersects(polygon, tmp, DEFAULT_EPSILON);
}
