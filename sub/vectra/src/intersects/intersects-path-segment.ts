import { segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { lineFamilyPolylineIntersects } from '../internal/polyline-relation';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import { flattenPathInto } from '../path/flatten.internal';
import type { PathCommand, PathMeasurementOptions, SegmentLike } from '../types';

/**
 * segment과 path가 교차하면 true를 반환한다.
 *
 * - path를 polyline으로 근사한 뒤 교차 여부를 판정한다. 근사 정밀도는 options.flatness로 제어한다.
 * - open subpath는 segment sequence이다. 마지막→첫 edge는 연결되지 않는다.
 * - empty path(commands.length === 0)는 false를 반환한다.
 *
 * @param line     교차를 검사할 segment
 * @param commands flatten할 path command sequence
 * @param options  flatten 옵션 (flatness, maxRecursion)
 */
export function intersectsPathSegment(
  commands: readonly PathCommand[],
  line: SegmentLike,
  options?: PathMeasurementOptions
): boolean {
  if (commands.length === 0) return false;
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const tmp: { x: number; y: number }[] = [];
  flattenPathInto(tmp, commands, options);
  return lineFamilyPolylineIntersects(lineParam, tmp, DEFAULT_EPSILON);
}
