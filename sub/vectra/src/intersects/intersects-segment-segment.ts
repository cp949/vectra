import { lineFamilyIntersects, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike } from '../types';

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
 */
export function intersectsSegmentSegment(a: SegmentLike, b: SegmentLike, epsilon = DEFAULT_EPSILON): boolean {
  const aa = readSegmentA(a);
  const ab = readSegmentB(a);
  const ba = readSegmentA(b);
  const bb = readSegmentB(b);
  return lineFamilyIntersects(
    segmentToLineFamilyParam(readX(aa), readY(aa), readX(ab), readY(ab)),
    segmentToLineFamilyParam(readX(ba), readY(ba), readX(bb), readY(bb)),
    epsilon
  );
}
