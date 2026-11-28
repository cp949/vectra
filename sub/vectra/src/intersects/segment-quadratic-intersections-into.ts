import { segmentToInfiniteLine } from './curve-facade.internal';
import { quadraticLineIntersectionsInto } from '../curve/quadratic-line-intersections-into';
import type { CurveIntersectionOptions, IntersectionHit } from '../types';
import type { QuadraticCurve, Segment } from '../types/flat-shapes.internal';

/**
 * segment와 quadratic Bezier curve의 교차점을 outHits에 기록한다.
 *
 * segment A→B를 origin=A, direction=B-A의 infinite-line으로 변환해
 * quadraticLineIntersectionsInto를 호출한 뒤 tA ∈ [0,1] 범위에 맞는 hit만 남긴다.
 * direction을 unit vector로 정규화하지 않으므로 tA가 segment parameter [0,1]로 유지된다.
 * tA는 segment parameter (A + (B-A)*tA), tB는 curve parameter [0,1]이다.
 *
 * @param outHits 결과 배열 (함수가 먼저 비운다)
 * @param segment 선분 A→B
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param options `epsilon`, `epsilonT`, `maxDepth`를 모두 지정한다. `maxDepth`는 교점 계산에 쓰지 않는다. 생략하면 기본값을 쓴다.
 * @returns 기록이 완료된 outHits (입력과 동일한 참조)
 */
export function segmentQuadraticIntersectionsInto(
  outHits: IntersectionHit[],
  segment: Segment,
  curve: QuadraticCurve,
  options?: Required<CurveIntersectionOptions>
): IntersectionHit[] {
  const line = segmentToInfiniteLine(segment);

  quadraticLineIntersectionsInto(outHits, curve, line, options);

  // segment는 tA ∈ [0,1] 범위만 유효하다 — 범위 밖 hit를 제거한다
  let i = outHits.length - 1;
  while (i >= 0) {
    const tA = outHits[i].tA;
    if (tA < 0 || tA > 1) {
      outHits.splice(i, 1);
    }
    i--;
  }
  return outHits;
}
