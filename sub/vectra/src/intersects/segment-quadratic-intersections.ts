import type { CurveIntersectionOptions, IntersectionHit } from '../types';
import type { QuadraticCurve, Segment } from '../types/flat-shapes.internal';
import { segmentQuadraticIntersectionsInto } from './segment-quadratic-intersections-into';

/**
 * segment와 quadratic Bezier curve의 교차점을 새 IntersectionHit[] 배열로 반환한다.
 *
 * segment를 기점 (x1, y1), 방향 (x2 - x1, y2 - y1)의 infinite-line으로 변환해
 * quadraticLineIntersectionsInto를 호출한 뒤 tA ∈ [0,1] 범위에 맞는 hit만 남긴다.
 * 방향 벡터를 unit vector로 정규화하지 않으므로 tA가 segment parameter [0,1]로 유지된다.
 * tA는 segment parameter ((x1, y1) + (x2 - x1, y2 - y1) * tA), tB는 curve parameter [0,1]이다.
 * 성능 최적화가 필요하면 `segmentQuadraticIntersectionsInto`를 사용한다.
 *
 * @param segment (x1, y1)에서 (x2, y2)로 가는 선분
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param options `epsilon`, `epsilonT`, `maxDepth`를 모두 지정한다. `maxDepth`는 교점 계산에 쓰지 않는다. 생략하면 기본값을 쓴다.
 * @returns 새로 만든 IntersectionHit 배열. 교차점이 없으면 빈 배열.
 */
export function segmentQuadraticIntersections(
  segment: Segment,
  curve: QuadraticCurve,
  options?: Required<CurveIntersectionOptions>
): IntersectionHit[] {
  return segmentQuadraticIntersectionsInto([], segment, curve, options);
}
