import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike, SegmentSegmentDetail } from '../types';
import { segmentSegmentDetailXY } from './segment-segment-detail.internal';

/**
 * 두 segment의 교차 관계 detail을 반환한다.
 *
 * boolean `intersectsSegmentSegment`로 손실되는 point/overlap/none 구분을 노출한다.
 * - proper crossing, T-crossing, shared endpoint, zero-length point hit, collinear endpoint
 *   touch는 `point`다.
 * - 길이를 가진 collinear overlap만 `overlap`이다. `start`/`end`와 `tA` tuple은 segment `a`
 *   기준 parameter 오름차순이고, `tB` tuple은 같은 순서로 대응한다.
 * - disjoint, parallel disjoint, collinear non-overlap은 `none`이다.
 * - zero-length segment는 점으로 환원해 다른 쪽 segment의 containment로 판정한다.
 *
 * 일반 좌표에서는 `intersectsSegmentSegment`와 같은 hit/no-hit를 유지한다. cross product가 overflow로
 * non-finite가 되는 대좌표에서는 scale-aware 계산이라 boolean보다 정확하게 갈릴 수 있다.
 *
 * 결과는 매 호출 새 plain object를 반환하며 입력 point object를 재사용하지 않는다.
 *
 * @param a 첫 번째 segment
 * @param b 두 번째 segment
 * @param epsilon 평행 판정 및 거리 임계값
 */
export function segmentSegmentDetail(a: SegmentLike, b: SegmentLike, epsilon = DEFAULT_EPSILON): SegmentSegmentDetail {
  const aa = readSegmentA(a);
  const ab = readSegmentB(a);
  const ba = readSegmentA(b);
  const bb = readSegmentB(b);
  return segmentSegmentDetailXY(
    readX(aa),
    readY(aa),
    readX(ab),
    readY(ab),
    readX(ba),
    readY(ba),
    readX(bb),
    readY(bb),
    epsilon
  );
}
