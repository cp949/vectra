import type { CurveIntersectionOptions, IntersectionHit, SegmentLike, XYInput } from '../types';
import { segmentQuadraticIntersectionsInto } from './segment-quadratic-intersections-into';

/**
 * segment와 quadratic Bezier curve의 교차점을 새 IntersectionHit[] 배열로 반환한다.
 *
 * segment A→B를 origin=A, direction=B-A의 infinite-line으로 변환해
 * quadraticLineIntersectionsInto를 호출한 뒤 tA ∈ [0,1] 범위에 맞는 hit만 남긴다.
 * direction을 unit vector로 정규화하지 않으므로 tA가 segment parameter [0,1]로 유지된다.
 * tA는 segment parameter (A + (B-A)*tA), tB는 curve parameter [0,1]이다.
 * 성능 최적화가 필요하면 `segmentQuadraticIntersectionsInto`를 사용한다.
 *
 * @param segment 선분 A→B
 * @param p0 quadratic curve 시작점
 * @param p1 quadratic curve 제어점
 * @param p2 quadratic curve 끝점
 * @param options epsilon, epsilonT 제어 옵션. 미지정 시 기본값 사용.
 * @returns 새로 만든 IntersectionHit 배열. 교차점이 없으면 빈 배열.
 */
export function segmentQuadraticIntersections(
  segment: SegmentLike,
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  options?: CurveIntersectionOptions
): IntersectionHit[] {
  const out: IntersectionHit[] = [];
  segmentQuadraticIntersectionsInto(out, segment, p0, p1, p2, options);
  return out;
}
