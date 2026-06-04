import { segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { lineFamilyPolygonIntersects } from '../internal/polygon-relation';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { PolygonLike, SegmentLike } from '../types';

/**
 * segment와 polygon이 교차하면 true를 반환한다.
 *
 * - 판정 조건 (OR):
 *   1. segment endpoint가 polygon 내부(경계 포함)에 있다.
 *   2. segment와 polygon edge가 교차한다.
 * - segment가 polygon 내부에 완전히 포함된 경우: endpoint containment로 true.
 * - collinear 꼭짓점, self-intersecting polygon도 동일한 규칙으로 판정한다.
 * - empty polygon (points.length < 3): false.
 *
 * @param polygon  교차를 검사할 polygon
 * @param line     교차를 검사할 segment
 * @param epsilon  교차 판정 허용 오차
 */
export function intersectsPolygonSegment(polygon: PolygonLike, line: SegmentLike, epsilon = DEFAULT_EPSILON): boolean {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  return lineFamilyPolygonIntersects(lineParam, polygon, epsilon);
}
