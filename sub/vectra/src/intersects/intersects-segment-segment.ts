import { lineFamilyIntersects } from '../internal/line-family';
import { fillSegmentParam, lineHitParamA, lineHitParamB } from '../internal/line-hit-read.internal';
import type { Segment } from '../types/flat-shapes.internal';

/**
 * 두 segment가 교차하면 true를 반환한다.
 *
 * 평행 (방향 벡터가 평행, 서로 다른 직선): false.
 * collinear이고 구간이 겹치면 true. 끝점만 일치하는 경우도 true.
 * zero-length segment는 점으로 환원해 다른 쪽 segment의 containment로 판정한다.
 *
 * @param a 첫 번째 segment
 * @param b 두 번째 segment
 * @param epsilon 평행 판정 및 거리 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function intersectsSegmentSegment(a: Segment, b: Segment, epsilon?: number): boolean {
  return lineFamilyIntersects(
    fillSegmentParam(lineHitParamA, a.x1, a.y1, a.x2, a.y2),
    fillSegmentParam(lineHitParamB, b.x1, b.y1, b.x2, b.y2),
    epsilon
  );
}
