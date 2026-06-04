import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike, XYObjectWritable } from '../types';
import { segmentSegmentDetailXY } from './segment-segment-detail.internal';

/**
 * 두 segment의 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * `segmentSegmentDetail`과 같은 계산을 source로 쓰고 point/overlap만 점으로 노출한다.
 * - proper crossing, T-crossing, shared endpoint, zero-length point hit, collinear endpoint touch
 *   (`point`)는 한 점을 push한다.
 * - 길이를 가진 collinear overlap(`overlap`)은 `start`, `end` 두 점을 segment `a` parameter `tA`
 *   오름차순으로 push한다.
 * - disjoint, parallel disjoint, collinear non-overlap, non-finite(`none`)는 빈 결과를 남긴다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }`
 * object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 평행 판정 및 거리 임계값이며 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param a 첫 번째 segment. point ordering의 기준이다.
 * @param b 두 번째 segment
 * @param epsilon 평행 판정 및 거리 임계값
 */
export function segmentSegmentIntersectionsInto(
  outPoints: XYObjectWritable[],
  a: SegmentLike,
  b: SegmentLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const aa = readSegmentA(a);
  const ab = readSegmentB(a);
  const ba = readSegmentA(b);
  const bb = readSegmentB(b);
  const detail = segmentSegmentDetailXY(
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

  outPoints.length = 0;
  if (detail.kind === 'point') {
    outPoints.push({ x: detail.point.x, y: detail.point.y });
  } else if (detail.kind === 'overlap') {
    outPoints.push({ x: detail.start.x, y: detail.start.y });
    outPoints.push({ x: detail.end.x, y: detail.end.y });
  }

  return outPoints;
}
