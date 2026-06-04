import type { CurveIntersectionHit, CurveIntersectionOptions, CurveLike, SegmentLike } from '../types';
import { segmentCurveIntersectionsInto } from './segment-curve-intersections-into';

/**
 * segment와 generic Bezier curve의 교차점을 새 배열로 반환한다.
 *
 * segment A→B를 infinite-line으로 변환해 `curve.kind`별 kernel을 호출한 뒤 segment parameter `[0, 1]`
 * 밖 hit를 제거한다.
 * 결과는 flat `{ x, y, kind, tLine, tCurve }`이고 `tLine`은 normalized segment parameter,
 * `tCurve`는 curve parameter `[0, 1]`이다. `kind`는 `cross`/`touch`만 사용한다.
 * zero-length segment는 빈 배열이다.
 * 성능 최적화가 필요하면 `segmentCurveIntersectionsInto`를 사용한다.
 *
 * @param segment 선분 A→B
 * @param curve quadratic 또는 cubic Bezier curve
 * @param options epsilon, epsilonT, maxDepth 제어 옵션. 미지정 시 기본값 사용.
 * @returns 새로 만든 facade hit 배열. 교차점이 없으면 빈 배열.
 */
export function segmentCurveIntersections(
  segment: SegmentLike,
  curve: CurveLike,
  options?: CurveIntersectionOptions
): CurveIntersectionHit[] {
  const out: CurveIntersectionHit[] = [];
  segmentCurveIntersectionsInto(out, segment, curve, options);
  return out;
}
