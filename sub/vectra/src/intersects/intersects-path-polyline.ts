import { segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { lineFamilyPolylineIntersects } from '../internal/polyline-relation';
import { flattenPathInto } from '../path/flatten.internal';
import type { PathCommand, PathMeasurementOptions, PolylineLike } from '../types';

/**
 * polyline과 path가 교차하면 true를 반환한다.
 *
 * - path를 polyline으로 근사한 뒤 판정한다. 근사 정밀도는 options.flatness로 제어한다.
 * - 판정 조건: flattened path의 임의 segment와 polyline segment가 교차한다.
 * - polyline은 open path이므로 면적을 정의하지 않는다. containment는 판정하지 않는다.
 * - empty polyline(points.length < 2) 또는 empty path(commands.length === 0): false.
 *
 * @param polyline 교차를 검사할 polyline
 * @param commands flatten할 path command sequence
 * @param options  flatten 옵션 (flatness, maxRecursion)
 */
export function intersectsPathPolyline(
  commands: readonly PathCommand[],
  polyline: PolylineLike,
  options?: PathMeasurementOptions
): boolean {
  if (commands.length === 0) return false;
  const tmp: { x: number; y: number }[] = [];
  flattenPathInto(tmp, commands, options);
  const n = tmp.length;
  if (n < 2) return false;
  for (let i = 0; i < n - 1; i++) {
    const seg = segmentToLineFamilyParam(tmp[i].x, tmp[i].y, tmp[i + 1].x, tmp[i + 1].y);
    if (lineFamilyPolylineIntersects(seg, polyline, DEFAULT_EPSILON)) return true;
  }
  return false;
}
