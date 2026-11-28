import type { CurveIntersectionOptions, IntersectionHit } from '../types';
import type { CubicCurve, Segment } from '../types/flat-shapes.internal';
import { segmentCubicIntersectionsInto } from './segment-cubic-intersections-into';

/**
 * segment와 cubic Bezier curve의 교차점을 새 IntersectionHit[] 배열로 반환한다.
 *
 * segment A→B를 origin=A, direction=B-A의 infinite-line으로 변환해
 * cubicLineIntersectionsInto를 호출한 뒤 tA ∈ [0,1] 범위에 맞는 hit만 남긴다.
 * direction을 unit vector로 정규화하지 않으므로 tA가 segment parameter [0,1]로 유지된다.
 * tA는 segment parameter (A + (B-A)*tA), tB는 curve parameter [0,1]이다.
 * 성능 최적화가 필요하면 `segmentCubicIntersectionsInto`를 사용한다.
 *
 * @param segment 선분 A→B
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param options `epsilon`, `epsilonT`, `maxDepth`를 모두 지정한다. `maxDepth`는 교점 계산에 쓰지 않는다. 생략하면 기본값을 쓴다.
 * @returns 새로 만든 IntersectionHit 배열. 교차점이 없으면 빈 배열.
 */
export function segmentCubicIntersections(
  segment: Segment,
  curve: CubicCurve,
  options?: Required<CurveIntersectionOptions>
): IntersectionHit[] {
  return segmentCubicIntersectionsInto([], segment, curve, options);
}
