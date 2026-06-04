import { cubicLineIntersectionsInto } from '../curve/cubic-line-intersections-into';
import { quadraticLineIntersectionsInto } from '../curve/quadratic-line-intersections-into';
import type { CurveIntersectionHit, CurveIntersectionOptions, CurveLike, IntersectionHit, SegmentLike } from '../types';
import { segmentToInfiniteLine, writeSegmentCurveHits } from './curve-facade.internal';

/**
 * segment와 generic Bezier curve의 교차점을 out에 기록한다.
 *
 * segment A→B를 origin=A, direction=B-A의 infinite-line으로 변환해 `curve.kind`별 kernel을 호출한 뒤
 * segment parameter `[0, 1]` 밖 hit를 제거한다. direction을 정규화하지 않으므로 `tLine`이 segment
 * parameter `[0, 1]`로 유지된다.
 * 결과는 flat `{ x, y, kind, tLine, tCurve }`이고 `tLine`은 normalized segment parameter,
 * `tCurve`는 curve parameter `[0, 1]`이다. `kind`는 `cross`/`touch`만 사용한다.
 * out을 먼저 비우고 범위 내 교차점을 push한다. zero-length segment는 빈 결과다.
 *
 * @param out 교차점을 기록할 facade hit 배열 (호출 전 내용은 무시되고 비워진다)
 * @param segment 선분 A→B
 * @param curve quadratic 또는 cubic Bezier curve
 * @param options epsilon, epsilonT, maxDepth 제어 옵션. 미지정 시 기본값 사용.
 */
export function segmentCurveIntersectionsInto(
  out: CurveIntersectionHit[],
  segment: SegmentLike,
  curve: CurveLike,
  options?: CurveIntersectionOptions
): void {
  const line = segmentToInfiniteLine(segment);
  const hits: IntersectionHit[] = [];
  if (curve.kind === 'quadratic') {
    quadraticLineIntersectionsInto(hits, curve.p0, curve.p1, curve.p2, line, options);
  } else {
    cubicLineIntersectionsInto(hits, curve.p0, curve.p1, curve.p2, curve.p3, line, options);
  }
  writeSegmentCurveHits(out, hits);
}
