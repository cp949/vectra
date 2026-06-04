import { cubicLineIntersectionsInto } from '../curve/cubic-line-intersections-into';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type {
  CurveIntersectionOptions,
  IntersectionHit,
  SegmentLike,
  XYInput,
  XYObjectWritable,
  XYWritable,
} from '../types';

/**
 * segment와 cubic Bezier curve의 교차점을 outHits에 push한다.
 *
 * segment A→B를 origin=A, direction=B-A의 infinite-line으로 변환해
 * cubicLineIntersectionsInto를 호출한 뒤 tA ∈ [0,1] 범위에 맞는 hit만 남긴다.
 * direction을 unit vector로 정규화하지 않으므로 tA가 segment parameter [0,1]로 유지된다.
 * tA는 segment parameter (A + (B-A)*tA), tB는 curve parameter [0,1]이다.
 *
 * @param outHits 결과 배열 (호출 전 비워야 한다)
 * @param segment 선분 A→B
 * @param p0 cubic curve 시작점
 * @param p1 cubic curve 첫 번째 제어점
 * @param p2 cubic curve 두 번째 제어점
 * @param p3 cubic curve 끝점
 * @param options epsilon, epsilonT 제어 옵션. 미지정 시 기본값 사용.
 */
export function segmentCubicIntersectionsInto<P extends XYWritable = XYObjectWritable>(
  outHits: IntersectionHit<P>[],
  segment: SegmentLike,
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  options?: CurveIntersectionOptions
): void {
  const a = readSegmentA(segment);
  const b = readSegmentB(segment);
  const ax = readX(a);
  const ay = readY(a);
  const line = {
    origin: { x: ax, y: ay },
    direction: { x: readX(b) - ax, y: readY(b) - ay },
  };

  cubicLineIntersectionsInto(outHits, p0, p1, p2, p3, line, options);

  // segment는 tA ∈ [0,1] 범위만 유효하다 — 범위 밖 hit를 제거한다
  let i = outHits.length - 1;
  while (i >= 0) {
    const tA = outHits[i].tA;
    if (tA < 0 || tA > 1) {
      outHits.splice(i, 1);
    }
    i--;
  }
}
