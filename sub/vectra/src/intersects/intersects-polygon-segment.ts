import {
  fillSegmentParam,
  lineHitParamA,
  lineHitSegmentA,
  lineHitSegmentB,
  lineHitX,
  lineHitY,
} from '../internal/line-hit-read.internal';
import { lineFamilyPolygonIntersects } from '../internal/polygon-line-family-hit.internal';
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
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function intersectsPolygonSegment(polygon: PolygonLike, line: SegmentLike, epsilon?: number): boolean {
  const a = lineHitSegmentA(line);
  const b = lineHitSegmentB(line);
  const lineParam = fillSegmentParam(lineHitParamA, lineHitX(a), lineHitY(a), lineHitX(b), lineHitY(b));
  return lineFamilyPolygonIntersects(lineParam, polygon, epsilon);
}
